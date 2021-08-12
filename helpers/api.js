const axios = require("axios");

class ApiHelper {
    async getRates(symbols, day) {
        try {
            const result = await axios.get(`http://api.exchangeratesapi.io/v1/${day}?access_key=${process.env.RATES_API_KEY}&symbols=${symbols.join(',')}&base=EUR`);
            delete result.data.success;
            return Promise.resolve(result.data);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ApiHelper;