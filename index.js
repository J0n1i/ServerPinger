const nodemailer = require("nodemailer")
const ping = require("ping")
const prompt = require("prompt-sync")({ sigint: true })
const fs = require("fs")
require("dotenv").config()

let host = ""
let interval = 5
let emails = []
let hostAlive = true
let writeLog = false
let sendStartEmail = false;

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
})

//prompt user for host, email, interval, and log file
host = prompt("Enter host address: ")

const emailInput = prompt("Enter email address (separate multiple addresses with ,): ")
emails = emailInput.split(",")

interval = prompt("Enter interval (default: 5s): ", 5)
if (interval < 5) {
    interval = 5
    console.log("Interval too short, setting to 5s")
}
if (isNaN(interval)) {
    interval = 5
    console.log("Invalid interval, setting to 5s")
}

writeLog = prompt("Write log to file? (y/n) (default: no): ", "n")

if (prompt("Send start email? (y/n) (default: no): ", "n") == "y") {
    sendStartEmail = true
}




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

if (sendStartEmail == true) {
    sendMail("ServerPinger started!", "Date: " + new Date().toLocaleString() + "\nHost: " + host + "\nInterval: " + interval + "s\nEmail list: " + emails + "\n\nDo not reply to this email.")
}

//initial ping
ping.promise.probe(host).then((res) => {
    hostAlive = res.alive
    if (res.alive == true) {
        CustomLog("Initial ping: " + host + " is alive.")
    } else {
        CustomLog("Initial ping: " + host + " is dead")
    }
})


setInterval(() => {
    ping.promise.probe(host).then((res) => {
        const date = new Date().toLocaleString()
        if (res.alive == true) {
            CustomLog(date + " - " + host + " is alive. Response time " + res.time + "ms")
            if (hostAlive == false) {
                sendMail("Server online!", host + " is back online! \nDate: " + date + "\n\nDo not reply to this email.")
            }
            hostAlive = true
        } else {
            CustomLog(date + " - " + host + " is dead")
            if (hostAlive == true) {
                sendMail("Server offline!", host + " is offline! \nDate: " + date + "\n\nDo not reply to this email.")
            }
            hostAlive = false
        }
    })
}, interval * 1000)



function sendMail(subject, message) {
    if (emails[0] == "") {
        CustomLog("No email address provided, skipping email...")
        return
    }

    CustomLog("Sending email...")


    emails.forEach(email => {
        let mailOptions = {
            from: "ServerPinger",
            to: email,
            subject: subject,
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