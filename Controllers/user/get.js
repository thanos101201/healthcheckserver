const axios = require('axios');
const userModel = require('../../models/user');

const getEmail = async (config) => {
    return await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', config)
}
const get = async(req, res) => {
    const accTk = req.headers.acctk;
    const config = {
        headers: {
            'Authorization': 'Bearer ' + accTk 
        }
    }
    await getEmail(config).then((resp1) => {
        let email = resp1.data.email;
        userModel.find({
            email: email
        }).then((resp2) => {
            if(resp2.length === 0){
                res.status(204).send();
            }
            else{
                res.send({
                    'message': 'User Details are here',
                    'data': resp2
                });
            }
        }).catch((er2) => {
            res.status(500).send(er2);
        });
    }).catch((er1) => {
        res.status(500).send(er1);
    })
}

module.exports = get;