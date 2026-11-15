import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const client = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (!error.response) return 'Cannot reach the link service. Check your connection and API URL.';
  return 'Something went wrong. Please try again.';
}

export const shortenUrl = async (payload) => (await client.post('/urls/shorten', payload)).data.url;
export const getBatchUrls = async (shortCodes) => (await client.post('/urls/batch', { shortCodes })).data.urls;
export const getAnalytics = async (shortCode) => (await client.get(`/urls/analytics/${encodeURIComponent(shortCode)}`)).data;
