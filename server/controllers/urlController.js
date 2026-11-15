import { nanoid } from 'nanoid';
import { UAParser } from 'ua-parser-js';
import Url from '../models/Url.js';
import { RESERVED_SLUGS, validateCustomSlug, validateOriginalUrl } from '../utils/validateUrl.js';

const expirationDurations = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000
};

function publicUrl(doc, baseUrl) {
  return {
    id: doc._id,
    shortCode: doc.shortCode,
    shortUrl: `${baseUrl}/${doc.shortCode}`,
    originalUrl: doc.originalUrl,
    isCustom: doc.isCustom,
    expiresAt: doc.expiresAt,
    totalClicks: doc.totalClicks,
    createdAt: doc.createdAt
  };
}

export function createUrlController(baseUrl) {
  return {
    async shorten(req, res, next) {
      try {
        const checkedUrl = validateOriginalUrl(req.body?.originalUrl);
        if (!checkedUrl.valid) {
          return res.status(400).json({ message: checkedUrl.message });
        }

        const hasAlias = typeof req.body?.customAlias === 'string' && req.body.customAlias.trim() !== '';
        let shortCode;
        if (hasAlias) {
          const checkedSlug = validateCustomSlug(req.body.customAlias);
          if (!checkedSlug.valid) {
            return res.status(400).json({ message: checkedSlug.message });
          }
          shortCode = checkedSlug.value;
          if (await Url.exists({ shortCode })) {
            return res.status(409).json({ message: 'That custom alias is already taken.' });
          }
        } else {
          shortCode = nanoid(7);
        }

        const expiration = req.body?.expiration;
        if (expiration && !Object.hasOwn(expirationDurations, expiration)) {
          return res.status(400).json({ message: 'Choose a supported expiration period.' });
        }

        const doc = await Url.create({
          originalUrl: checkedUrl.value,
          shortCode,
          isCustom: hasAlias,
          expiresAt: expiration ? new Date(Date.now() + expirationDurations[expiration]) : null
        });
        return res.status(201).json({ url: publicUrl(doc, baseUrl) });
      } catch (error) {
        if (error?.code === 11000) {
          return res.status(409).json({ message: 'That custom alias is already taken.' });
        }
        return next(error);
      }
    },

    async batch(req, res, next) {
      try {
        const codes = req.body?.shortCodes;
        if (!Array.isArray(codes) || codes.length > 100 || codes.some((code) => typeof code !== 'string' || code.length > 40)) {
          return res.status(400).json({ message: 'Provide up to 100 valid short codes.' });
        }

        const normalized = [...new Set(codes.map((code) => code.trim()).filter((code) => code && !RESERVED_SLUGS.has(code)))];
        const urls = await Url.find({ shortCode: { $in: normalized }, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] })
          .sort({ createdAt: -1 })
          .lean();
        return res.json({ urls: urls.map((url) => publicUrl(url, baseUrl)) });
      } catch (error) {
        return next(error);
      }
    },

    async analytics(req, res, next) {
      try {
        const url = await Url.findOne({ shortCode: req.params.shortCode }).lean();
        if (!url || (url.expiresAt && url.expiresAt <= new Date())) {
          return res.status(404).json({ message: 'Link not found or expired.' });
        }

        const clicksByDay = new Map();
        const devices = new Map();
        const browsers = new Map();
        const referrers = new Map();
        for (const click of url.analytics) {
          const day = new Date(click.timestamp).toISOString().slice(0, 10);
          clicksByDay.set(day, (clicksByDay.get(day) ?? 0) + 1);
          devices.set(click.device || 'Unknown', (devices.get(click.device || 'Unknown') ?? 0) + 1);
          browsers.set(click.browser || 'Unknown', (browsers.get(click.browser || 'Unknown') ?? 0) + 1);
          referrers.set(click.referrer || 'Direct', (referrers.get(click.referrer || 'Direct') ?? 0) + 1);
        }

        const dailyClicks = [...clicksByDay].map(([date, clicks]) => ({ date, clicks })).sort((a, b) => a.date.localeCompare(b.date));
        return res.json({
          url: publicUrl(url, baseUrl),
          totalClicks: url.totalClicks,
          dailyClicks,
          devices: [...devices].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
          browsers: [...browsers].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
          referrers: [...referrers].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
        });
      } catch (error) {
        return next(error);
      }
    },

    async redirect(req, res, next) {
      try {
        const url = await Url.findOne({ shortCode: req.params.shortCode }).select('originalUrl expiresAt').lean();
        if (!url || (url.expiresAt && url.expiresAt <= new Date())) {
          return res.status(404).type('text').send('This short link is unavailable or has expired.');
        }

        res.redirect(302, url.originalUrl);
        const userAgent = new UAParser(req.get('user-agent') || '').getResult();
        const rawReferrer = req.get('referer');
        let referrer = 'Direct';
        if (rawReferrer) {
          try {
            referrer = new URL(rawReferrer).hostname || 'Direct';
          } catch {
            referrer = 'Other';
          }
        }
        const click = {
          timestamp: new Date(),
          device: userAgent.device.type || 'Desktop',
          browser: userAgent.browser.name || 'Unknown',
          os: userAgent.os.name || 'Unknown',
          referrer
        };
        Url.updateOne({ _id: url._id }, { $inc: { totalClicks: 1 }, $push: { analytics: click } })
          .catch((error) => console.error('Failed to record link click:', error));
      } catch (error) {
        return next(error);
      }
    }
  };
}
