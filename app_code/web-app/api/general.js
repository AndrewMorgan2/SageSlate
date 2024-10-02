const { exec } = require('child_process');

async function sendCommand(req, res) {
    const command = req.query.path;
    console.log(command);
    try {
        const result = await runCommand(command);  // Use await here
        console.log("Command ran", result);
        res.status(200).json({ message: "Command executed successfully", output: result });
    } catch (error) {
        console.log("Command failed", error);
        res.status(500).json({ message: "Command execution failed", error });
    }
}

function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
}

module.exports = {
    sendCommand
};