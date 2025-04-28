const jwt = {
    sign: jest.fn(() => 'mocked-token'),
  };
  
  module.exports = jwt;