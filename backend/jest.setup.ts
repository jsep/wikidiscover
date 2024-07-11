import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();
global.FormData = require('form-data');
