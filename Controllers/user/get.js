const { google } = require('googleapis');
const request = require('request');
const queryPArse = require('query-string');
const urlParse = require('url-parse');
const userModel = require('../../models/user');
const axios = require('axios');
const walletModel = require('../../models/wallet');

//function to get the email using authClient
const getEmail = async (authClient) => {
    const people = google.people({//creating people's client for fetching email data
        version: 'v1',
        auth: authClient
    });
    //returning the email address using people's client
    return await people.people.get({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses'
    });
}
//function to check badge
//function to get user using the email id
const getUser = async (email) => {
    //returning the promise with response obtained using the mongodb query
    return await userModel.find({
        email: email
    })
}
//function to get the minutes as well as calorie id
const getMintAndCalId = async (url, config) => {
    return await axios.get(url, config) //returning the response obtained from the axios library
}
//obtaining the calorie id
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
//function to obtain minutes id
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
//function to add user in database
const addUser = async (email, mintId, mintDt, calId, name) => {
    let userm = new userModel();
    userm.email = email;
    userm.streamId = mintId;
    userm.calId = calId;
    userm.name = name;
    userm.points = mintDt;
    let mnt = new Date().getMonth() + 1;
    userm.date = new Date().getDate() + '/' + mnt + '/' + new Date().getFullYear();                    
    userm.lastUpdate = ""+ new Date().getDate() + " / " + new Date().getMonth() + " / " + new Date().getFullYear() + " || " + new Date().getHours() + " : " + new Date().getMinutes()
    return await userm.save() //returning the promise obtained by saving the user at mongo db atlas
}

//function to handle badges
const chkBdg = (lstDt, ar, eml) => {
    const dtar = lstDt.split("/")
    let dt = new Date().getDate();
    let mnt = new Date().getMonth();
    let yer = new Date().getFullYear();
    let bdg = "none";
    if((parseInt(dtar[0]) === dt && mnt - parseInt(dtar[1]) === 1) || (parseInt(dtar[2]) < yer)){
        if(ar[0].email === eml){
            bdg = "gold";
        }
        else if(ar[1].email === eml){
            bdg = "silver";
        }
        else if(ar[2].email === eml){
            bdg = "bronze";
        }
    }
    return bdg;
}

//function to get the fitness data related to the heart minutes

const getMintData = async (oauth2Client, min_id) => {
    const fitness = google.fitness('v1'); // creating the fitness client object
    const startDate1 = new Date();
    startDate1.setDate(1);
    // startDate1.setMonth(startDate1.getMonth()); // Subtract one month from current date
    const startTimeMillis = startDate1.getTime(); // Get start time in milliseconds
    const endTimeMillis = Date.now();
    return await fitness.users.dataset.aggregate({ // returning the promise obtained by requesting the fitness relted data
        userId: 'me',
        requestBody: {
            aggregateBy: [
            {
                dataTypeName: 'com.google.heart_minutes',
                dataSourceId: min_id // 'derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes',
            },
            ],
            bucketByTime: {
            durationMillis: 86400000, // 24 hours in milliseconds
            },
            startTimeMillis: startTimeMillis, // Replace with your desired start time
            endTimeMillis: endTimeMillis, // Replace with your desired end time
        },
        auth: oauth2Client,
    })
}
//function to calculate the minutes data using the response obtained 
//using the fitness client
const calculateMintData = (resp5) => {
    let mint = 0;
    if(resp5.data.bucket.length > 0){
        resp5.data.bucket.map((e2,k2) => {
            if(e2.dataset.length > 0){
                e2.dataset.map((e3, k3) => {
                    if(e3.point.length > 0){
                        e3.point.map((e4, k4) => {
                            mint = mint + e4.value[0].fpVal;
                        });
                    }
                })
            }
        });
    }
    // console.log("resp5 mintdt 106 :- "+mint);
    return mint;
}
//function to obtain the calorie data
const getCalDt = async (oauth2Client, cal_id) => {
    const fitness = google.fitness('v1'); //creating fitness client for gathering calorie data
    const startDate = new Date();
    startDate.setDate(19);
    startDate.setMonth(6 - 1);
    const startTimeMillis = startDate.getTime();
    const endTimeMillis = Date.now();
    return await fitness.users.dataset.aggregate({ //returning the data obtained
        userId: 'me',
        requestBody: {
            aggregateBy: [
            {
                dataTypeName: 'com.google.calories.expended', //'merge_calories_expended',// 'com.google.heart_minutes',
                dataSourceId: cal_id //'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended' //'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'// resp1[0].streamId // 'derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes',
            },
            ],
            bucketByTime: {
            durationMillis: 86400000, // 24 hours in milliseconds
            },
            startTimeMillis: startTimeMillis, // Replace with your desired start time
            endTimeMillis: endTimeMillis, // Replace with your desired end time
        },
        auth: oauth2Client,
    })
}
//function to calculate the calorie data
const calculateCalData = (resp6) => {
    let cal = 0;
    if(resp6.data.bucket.length > 0){
        console.log("resp6 length 136 :- "+resp6.data.bucket.length)
        resp6.data.bucket.map((e2,k2) => {
            if(e2.dataset.length > 0){
                e2.dataset.map((e3, k3) => {
                    if(e3.point.length > 0){
                        e3.point.map((e4, k4) => {
                            cal = cal + e4.value[0].fpVal;
                        });
                    }
                })
            }
        });
    }
    console.log("cal 149 :- "+cal)
    return cal;
}
//function to update user data
const updateUser = async (email, mint) => {
    
    return await userModel.updateOne({
        email: email
    }, {
        points: mint,
        lastUpdate: ""+ new Date().getDate() + " / " + new Date().getMonth() + " / " + new Date().getFullYear() + " || " + new Date().getHours() + " : " + new Date().getMinutes()
    })
}
//function to get the wallet data
const getWalletDt = async (email) => {
    return await walletModel.find({
        email: email
    })
}
//function to update wallet details
const updateWallet = async (email, cal, netExpense) => {
    return await walletModel.updateOne({
        email: email
    }, {
        amount: `${cal - netExpense}`
    })
}
//function to add wallet details
const addWallet = async (email, amount) => {
    let walletm = new walletModel();
    walletm.email = email;
    walletm.amount = amount;
    walletm.netExpense = "0"
    walletm.transactionHistory = [];
    return await walletm.save()
}
//function to handle and manage all the fitness as well as user creation operation
const get = (req, res) => {
    try{
        const access_token = req.headers.access_token;
        const refresh_token = req.headers.refresh_token;
        //creating oauth2Client
        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "http://localhost:3001/points",
            true
        );
        //setting oauth2Cliet credentials
        oauth2Client.setCredentials({
            access_token: access_token
        });
        let peopleAPI = getEmail(oauth2Client)//fetching user's email
        peopleAPI.then((resp1) => {
            let email = resp1.data.emailAddresses[0].value;
            let name = resp1.data.names[0].displayName;
            const userDt = getUser(email) //fetching user's data
            userDt.then((resp2) => {
                if(resp2.length === 0){
                    const opt1 = {
                        method: "GET",
                        headers: {
                            authorization: "Bearer " + access_token,
                        },
                        "Content-Type": "application/json",
                        url: `https://www.googleapis.com/fitness/v1/users/me/dataSources`,
                    }
                    const config = {
                        headers: {
                        Authorization: "Bearer " + access_token,
                        },
                    };
                    const mintAndCalId = getMintAndCalId(opt1.url, config) //obtaining minutes and calorie id
                    mintAndCalId.then((resp3) => {
                        let mintId = obtainMintId(resp3);
                        let calId = obtainCalId(resp3);
                        if(mintId === "" || calId === ""){
                            res.send({
                                'message': 'Please install google fit application'
                            });
                        }
                        else{
                            let mint_dt = getMintData(oauth2Client, mintId)
                            mint_dt.then((resp4) => {
                                let mintDt = calculateMintData(resp4);
                                let userDt = addUser(email, mintId, mintDt, calId, name);
                                userDt.then((resp5) => {
                                    let calDt = getCalDt(oauth2Client, calId) //getting calorie data
                                    calDt.then((resp6) => {
                                        let cal_dt = calculateCalData(resp6); //calculate calorie data
                                        let walltMd = addWallet(email, cal_dt) //adding wallet details in the database
                                        walltMd.then((resp7) => {
                                            //returning response
                                            res.send({
                                                'message': 'Data Updated'
                                            });
                                        }).catch((er7) => {
                                            res.send(er7);
                                        })
                                    }).catch((er6) => {
                                        res.send(er6);
                                    })
                                }).catch((er5) => {
                                    res.send(er5);
                                })
                            }).catch((er4) => {
                                res.send(er4);
                            })
                        }
                    }).catch((er3) => {
                        res.send(er3);
                    })
                }
                else{
                    let mint_dt = getMintData(oauth2Client, resp2[0].streamId)//fetching minutes data using the data stream Id of heart minutes
                    mint_dt.then((resp3) => {
                        let mintDt = calculateMintData(resp3); //calculate the minute data
                        let cal_dt = getCalDt(oauth2Client, resp2[0].calId) //fetching the calorie data using the calorie data
                        cal_dt.then((resp4) => {
                            let calDt = calculateCalData(resp4); //calculating calorie data
                            let updateUserDt = updateUser(email, mintDt) //updating user's heart minutes data
                            updateUserDt.then((resp5) => {
                                let wltDt = getWalletDt(email) //fetching wallet details of user from the database
                                wltDt.then((resp6) => {
                                    let wltUpdt = updateWallet(email, calDt, resp6[0].netExpense) //updating the wallet details of the user
                                    wltUpdt.then((resp7) => {
                                        //returning the response to the user
                                        res.send({
                                            'message': 'Data Updated'
                                        })
                                    }).catch((er7) => {
                                        res.send(er7);
                                    })
                                }).catch((er6) => {
                                    res.send(er6);
                                })
                            }).catch((er5) => {
                                res.send(er5);
                            })
                        }).catch((er4) => {
                            res.send(er4);
                        })
                    }).catch((er3) => {
                        res.send(er3);
                    })
                }
            }).catch((er2) => {
                res.send(er2);
            })
        }).catch((er1) => {
            res.send(er1);
        })
    }catch(e){
        res.send(e);
    }
}

module.exports = get;
