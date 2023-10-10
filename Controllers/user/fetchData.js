const queryParse = require('query-string');
const urlParse = require('url-parse');
const axios = require('axios');
const { google } = require('googleapis');
const userModel = require('../../models/user');


const getUser = async (email) => {
    return await userModel.find({
        email: email
    })
}

const getToken = async (code) => {
    return await axios.post('https://oauth2.googleapis.com/token', {
        code: code,
        client_id: `611658826728-gp7el8t7t63g46o807c6unjd99tfg4lm.apps.googleusercontent.com`,
        client_secret: `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`,
        redirect_uri: 'http://localhost:3000/sign',
        grant_type: 'authorization_code'
    })
}
const getUserDetail = async (config) => {
    return await axios.get('https://openidconnect.googleapis.com/v1/userinfo', config)
}

const getMintDt = async (streamId, config) => {
    const fitness = google.fitness('v1');// creating the fitness client object
    const startDate1 = new Date();
    startDate1.setDate(1);
    console.log(` startdate :- ${startDate1}`);
    // startDate1.setMonth(startDate1.getMonth() -1); // Subtract one month from current date
    const startTimeMillis = startDate1.getTime(); // Get start time in milliseconds
    const endTimeMillis = new Date();
    console.log(`endtime : -${endTimeMillis}`);
    return await axios.post("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
        aggregateBy: [
        {
            dataTypeName: 'com.google.heart_minutes',
            dataSourceId: streamId // 'derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes',
        },
        ],
        bucketByTime: {
        durationMillis: 86400000, // 24 hours in milliseconds
        },
        startTimeMillis: startTimeMillis, // Replace with your desired start time
        endTimeMillis: endTimeMillis.getTime(), // Replace with your desired end time
    }, config)
}
const calculateMintData = (resp3) => {
    let mints = 0;
    if(resp3.data.bucket.length > 0){
        resp3.data.bucket.map((e2,k2) => {
            if(e2.dataset.length > 0){
                console.log("Hello Namaste :- ")
                e2.dataset.map((e3, k3) => {
                    console.log("Namo :- "+e3.point.length);
                    if(e3.point.length > 0){
                        e3.point.map((e4, k4) => {
                            console.log("Namaste :- "+e4.value[0].fpVal);
                            mints = mints + e4.value[0].fpVal;
                        });
                    }
                })
            }
        });
    }
    console.log("Minutes data :- "+mints);
    return mints;
}
const getCalorieData = async (config, calId) => {
    const startDate1 = new Date();
    startDate1.setDate(1);
    // startDate1.setMonth(startDate1.getMonth() -1); // Subtract one month from current date
    const startTimeMillis = startDate1.getTime(); // Get start time in milliseconds
    const endTimeMillis = Date.now();
    return await axios.post("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
        aggregateBy: [
            {
                dataTypeName: 'com.google.calories.expended', //'merge_calories_expended',// 'com.google.heart_minutes',
                dataSourceId: calId //'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended' //'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'// resp1[0].streamId // 'derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes',
            },
        ],
        bucketByTime: {
        durationMillis: 86400000, // 24 hours in milliseconds
        },
        startTimeMillis: startTimeMillis, // Replace with your desired start time
        endTimeMillis: endTimeMillis, // Replace with your desired end time
    }, config)
}
//function to calculate the calorie data
const calculateCalorie = (resp5) => {
    let cals = 0;
    if(resp5.data.bucket.length > 0){
        resp5.data.bucket.map((e2,k2) => {
            if(e2.dataset.length > 0){
                e2.dataset.map((e3, k3) => {
                    if(e3.point.length > 0){
                        e3.point.map((e4, k4) => {
                            cals = cals + e4.value[0].fpVal;
                        });
                    }
                })
            }
        });
    }
    return cals;
}
const obtainMintId = (resp3) => {
    let min_id = "";
    if(resp3.data.dataSource !== undefined && resp3.data.dataSource.length > 0){
        resp3.data.dataSource.map((e1,k1) => {
            if(e1.dataStreamName === "merge_heart_minutes"){
                min_id = e1.dataStreamId;
            }
        });
    }
    //returning the minutes id
    return min_id;
}
const obtainCalId  = (resp3) => {
    let cal_id = "";
    if(resp3.data.dataSource !== undefined && resp3.data.dataSource.length > 0){
        resp3.data.dataSource.map((e1,k1) => {
            if(e1.dataStreamName === "merge_calories_expended"){
                cal_id = e1.dataStreamId;
            }
        });
    }
    //returning the calorie id
    return cal_id;
}

const fetchStreamIdStore = async (config) => {
    return await axios.get('https://www.googleapis.com/fitness/v1/users/me/dataSources',config)
}

// const addUser = async (email, name, calor, minute, calId, mintId) => {
//     let userm = new userModel();
//     console.log("In add user");
//     userm.name = name;
//     userm.email = email;
//     userm.minutes[`${new Date().getMonth() + 1}:${ new Date().getFullYear()}`] = minute;
//     userm.calorie[`${new Date().getMonth() + 1}:${ new Date().getFullYear()}` ] = calor;
//     userm.calId = calId;
//     userm.mintId = mintId;
//     return await userm.save()
// }
const addUser = async (email, name, calor, minute, calId, mintId) => {
    let userm = new userModel();
    console.log("In add user");
    userm.name = name;
    userm.email = email;

    // Corrected usage of getMonth and getFullYear
    const monthYearKey = `${new Date().getMonth() + 1}:${new Date().getFullYear()}`;
    let obj1 = {
        [monthYearKey] : minute
    }
    let obj2 = {
        [monthYearKey]: calor
    }
    userm.minutes = obj1;
    userm.calorie = obj2;
    userm.calId = calId;
    userm.minuteId = mintId;

    return userm.save();
};

const updateUser = async(email, calor, minute) => {
    return await userModel.find({
        email: email
    }).then(async (resp1) => {
        if(resp1.length === 0){
            return "Email not registered";
        }
        else{
            let calorie = resp1[0].calorie
            let minutes = resp1[0].minutes;
            minutes[`${new Date().getMonth() + 1}:${ new Date().getFullYear()}`] = minute;
            calorie[`${new Date().getMonth() + 1}:${ new Date().getFullYear()}`] = calor;
            return await userModel.updateOne({
                email: email
            }, {
                minutes: minutes,
                calorie: calorie
            })
        }
    })
}
const fetchData= (req, res) => {
    const code = req.headers.code;
    // res.send(`Code is ${code}`);
    getToken(code).then((resp1) => {
        if(resp1.status === 200){
            const config = {
                headers: {
                    'Authorization': 'Bearer ' + resp1.data.access_token
                }
            };
            // console.log(` resp1.data.access_token : ${resp1.data.access_token}`);
            getUserDetail(config).then(async (resp2) => {
                if(resp2.status === 200){
                    let email = resp2.data.email;
                    let name = resp2.data.name;
                    const oauth2Client = new google.auth.OAuth2(
                        `611658826728-gp7el8t7t63g46o807c6unjd99tfg4lm.apps.googleusercontent.com`,
                        `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`,
                        'http://localhost:3000/sign',
                        true
                    );
                    oauth2Client.setCredentials({
                        access_token: resp1.data.access_token
                    });
                    await getUser(email).then(async (resp3) => {
                        if(resp3.length === 0){
                            fetchStreamIdStore(config).then(async (resp4) => {
                                let mintId = obtainMintId(resp4);
                                let calId = obtainCalId(resp4);
                                console.log(`CalId : ${calId}, MintId : ${mintId}`);
                                if(mintId === "" || calId === ""){
                                    res.status(400).send({
                                        'message': 'Please install google fit application'
                                    });
                                }
                                else{
                                    await getMintDt(mintId, config).then(async (resp5) => {
                                        console.log("resp5");
                                        let minutes = calculateMintData(resp5);
                                        await getCalorieData(config, calId).then(async (resp6) => {
                                            let calories = calculateCalorie(resp6);
                                            console.log("calories : "+calories);
                                            let minute = {
                                                date: new Date(),
                                                minute: minutes
                                            };
                                            let calor = {
                                                date : new Date(),
                                                calorie: calories
                                            }
                                            await addUser(email, name, calories, minutes, calId, mintId).then((resp7) => {
                                                console.log("Added it is");
                                                res.status(200).send({
                                                    'message': 'User added',
                                                    'acc_tk': resp1.data.access_token
                                                });
                                            }).catch((er7) => {
                                                res.status(500).send(er7);
                                            })
                                        }).catch((er6) => {
                                            res.status(500).send(er6);
                                        })
                                    }).catch((er5) => {
                                        res.status(500).send(er5);
                                    })
                                }
                            }).catch((er4) => {
                                res.status(500).send(er4);
                            })
                        }
                        else{
                            await getMintDt(resp3[0].mintId, config).then(async (resp4) => {
                                console.log(`Resp3 :- ${resp4}`);
                                let minutes = calculateMintData(resp4);
                                await getCalorieData(config, resp3[0].calId).then(async (resp5) => {
                                    let calorie = calculateCalorie(resp5);
                                    await updateUser(email, calorie, minutes).then((resp6) => {
                                        res.status(200).send({
                                            'message': 'User updated',
                                            'acc_tk': resp1.data.access_token
                                        });
                                    }).catch((er6) => {
                                        res.status(500).send(er6);
                                    })
                                }).catch((er5) => {
                                    res.status(500).send(er5);
                                });
                            }).catch((er4) => {
                                res.status(500).send(er4);
                            });
                        }
                    }).catch((er3) => {
                        res.status(500).send(er3);
                    })
                }
            }).catch((er2) => {
                res.status(500).send(er2);
            })
        }
    }).catch((er1) => {
        res.status(500).send(er1);
    })
}

module.exports = fetchData;