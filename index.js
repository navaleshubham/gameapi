require('dotenv').config();
const express = require('express');
var mongo = require('./mongodbconnection');
bodyParser = require('body-parser');
cors = require('cors');
var game = require('./model/game')
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors()); //corss origin 
let cookieParser = require('cookie-parser') //for stroring the userdata
app.use(cookieParser());
const jwt = require('jsonwebtoken') //for configuration of sessions
mongo.connectDatabase() //database connection
let refreshtokens = []// for faster operartion in multiple user environment
var cindex=0
const r=1
const y=-1

function genrateefreshtoken(use){
    const refreshtoken = jwt.sign(use, process.env.REFRESH_TOKEN_SECRET);
    refreshtokens.push(refreshtoken);
    return refreshtoken
}

function checkresult(mat){
    for(var i=0;i<6;i++){
        console.log(String(mat[i]))
    }
    var case1r=0
    var case1y=0
    var case2r=0
    var case2y=0
    var case3r=0
    var case3y=0
    var case4r=0
    var case4y=0
    var case5r=0
    var case5y=0
    var case6r=0
    var case6y=0

    for(var j=0;j<6;j++){
        for(var k=0;k<7;k++){
            if(mat[j][k]==1){
                case2r=case2r+mat[j][k]
                if(case2r==4){
                    return ('red wins')
                }
            }
            else{
                case2y=case2y+mat[j][k]
                if(case2y==-4){
                    return ('yellow wins')
                }
            }
        }
        case2r=0
        case2y=0
    }
    for(var j=0;j<7;j++){
        for(var k=0;k<6;k++){
            if(mat[k][j]==1){
                case3r=case3r+mat[k][j]
                if(case3r==4){
                    return ('red wins')
                }
            }
            else{
                case3y=case3y+mat[k][j]
                if(case3y==-4){
                    return ('yellow wins')
                }
            }
        }
        case3r=0
        case3y=0
    }
    for(var j=0;j<7;j++){
        for(k=0;k<6;k++){
            if(i==j){
                if(mat[k][j]==1){
                    case1r=case1r+mat[k][j]
                    if(case1r==4){
                        return ('red wins')
                    }
                }
                else{
                    case1y=case1y+mat[k][j]
                    if(case1y==-4){
                        return ('yellow wins')
                    }
                }
            }
        }
    }
    for(var j=6;j<=0;j--){
        if(j==0){break;}
        if(mat[6-j][j]==1){
            case4r=case4r+mat[6-j][j]
            if(case4r==4){
                return ('red wins')
            }
        }
        else{
            case4y=case4y+mat[6-j][j]
            if(case4y==-4){
                return ('yellow wins')
            }
        }
    }
    for(var j=5;j<=0;j--){    
        if(mat[j][5-j]==1){
            case5r=case5r+mat[j][5-j]
            if(case5r==4){
                return ('red wins')
            }
        }
        else{
            case5y=case5y+mat[j][5-j]
            if(case5y==-4){
                return ('yellow wins')
            }
        }
    }
    for(var j=5;j<=0;j--){
        for(k=6;k<=0;k--){
        if(mat[j][k]==1){
            case6r=case6r+mat[j][k]
            if(case6r==4){
                return ('red wins')
            }
        }
        else{
            case6y=case6y+mat[j][k]
            if(case6y==-4){
                return ('yellow wins')
            }
        }
    }
    }
    
}

app.get('/START/:name',(req,res)=>{
    var name=req.params.name
    var mat=[]
    var inmat=[]
    for(var i=0;i<6;i++){
        for(j=0;j<7;j++){
            inmat.push(0)
        }
        mat.push(inmat)
        inmat=[]
    }
    var rtoken=genrateefreshtoken(name)
    res.cookie('refreshtoken',rtoken)
    var g={'Matrix':mat,'palyertoken':rtoken,'cplay':false}
    var gam=new game(g,(err,result)=>{
        console.log(err,result)
    })
    gam.save()
    cindex=cindex+1
    res.send('READY \n Yellow player move')
})

app.get('/getentry/:colnum',(req,res)=>{
    var colnum=parseInt(req.params.colnum)-1
    var token=req.cookies.refreshtoken
    game.find({palyertoken:token},(err,result)=>{
        if(err) return res.send(403)
        var mat=result[0].Matrix
        var cplay=result[0].cplayer
        // console.log(mat)
        for(var i=5;i>=0;i--){
            var v=mat[i][colnum]
            // console.log(v)
            if(v!=-1 && v!=1){
                if(cplay){
                    mat[i][colnum]= 1
                }
                else{
                    mat[i][colnum]= -1
                }
                update=true
                // console.log(mat,cplay)
                cplay=!cplay
                game.updateOne({palyertoken:token},{$set:{Matrix:mat,cplayer:cplay,moves:{$push:colnum}}},(err,result)=>{
                    if(err) return res.send(403)
                    c=checkresult(mat)
                    if(c!=undefined){
                        game.updateOne({palyertoken:token},{$set:{Winner:c}},(err,result)=>{
                            if(err) return res.send(403)
                        })
                        return res.send(c)
                    }
                    if(cplay){
                        return res.send('red palyer move')
                    }
                    else{
                        return res.send('yellow palyer move')
                    }
                })
                break;
            }
            else{
                if(i==0){
                    return res.send('invalid move')
                }
                continue;
            }
            
        }
    })
})


  
//server loaction configuration
const port = process.env.PORT || 4000;
const server = app.listen(port, function () {
    console.log('Listening on port ' + port);
});
