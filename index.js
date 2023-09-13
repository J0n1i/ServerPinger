const nodemailer = require("nodemailer")
const ping = require("ping")
const prompt = require("prompt-sync")({sigint: true})
const fs = require("fs")
require("dotenv").config()

let host = ""
let interval = 5
let email = ""
let hostAlive = true
let writeLog = false

//prompt user for host adn interval
host = prompt("Enter host address: ")
interval = prompt("Enter interval (default 5s): ", 5)
if (interval < 5) {
    interval = 5
    console.log("Interval too short, setting to 5s")
}
if (isNaN(interval)) {
    interval = 5
    console.log("Invalid interval, setting to 5s")
}

email = prompt("Enter email address: ")
writeLog = prompt("Write log to file? (y/n): ", "y")

const startDate = new Date().toLocaleString().replace(/\//g, "-").replace(/:/g, "-").replace(/,/g, "")
const logFileName = "ServerPinger log-" + startDate + ".txt"


if (writeLog == "y") {
    
    writeLog = true
    fs.writeFile(logFileName, "", function (err) {
        if (err) throw err
    })
} else {
    writeLog = false
}

CustomLog("Starting...")
//initial ping
ping.promise.probe(host).then((res) => {
    hostAlive = res.alive
    if (res.alive == true) {
        CustomLog("Initial ping: " + host + " is alive.")
    } else {
        CustomLog("Initial ping: " + host + " is dead")
    }
})


let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
})


setInterval(() => {
    ping.promise.probe(host).then((res) => {
        const date = new Date().toLocaleString()
        if (res.alive == true) {
            CustomLog(date + " - " + host + " is alive. Response time " + res.time + "ms")
            if (hostAlive == false) {
                sendMail(host + " is back online!")
            }
            hostAlive = true
        } else {
            CustomLog(date + " - " + host + " is dead")
            if (hostAlive == true) {
                sendMail(host + " is offline!")
            }
            hostAlive = false
        }
    })
}, interval * 1000)



function sendMail(message) {
    if (email == "") {
        CustomLog("No email address provided, skipping email...")
        return
    }

    CustomLog("Sending email...")


    let mailOptions = {
        from: "ServerPinger",
        to: email,
        subject: "ServerPinger",
        text: message,
        //if log file exists, attach it to the email
        attachments: fs.existsSync(logFileName) ? [{ path: logFileName }] : []
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            CustomLog(error)
        } else {
            CustomLog("Email sent: " + info.response)
        }
    })

}

function CustomLog(log) {
    console.log(log)
    if (writeLog == true) {
        fs.appendFile(logFileName, log + "\n", function (err) {
            if (err) throw err
        })
    }
}