const bcrypt = require("bcrypt");
const { db } = require("../config/dbConfig");
const { createToken } = require("../middleware/jwtMiddleware");

// Function to handle cashier login
// Route" POST /api/cashier/login
async function cashierLogin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        const  [cashierDetails] = await db.query("SELECT * FROM cashiers WHERE email = ?", [email]);

        if (cashierDetails.length != 0 && (await bcrypt.compare(password, cashierDetails[0].password))){
            const payload = { cashier_id: cashierDetails[0].cashier_id, role: "cashier" };
            const token = createToken(payload);

            res.cookie("authToken", token, { 
                httpOnly: true, 
                sameSite: "Strict"
            });
            return res.status(200).json({ message: "Login successful"});
        } else {
            return res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to handle cashier getting user account info
// Route: POST /api/cashier/userAccountInfo
async function cashierUserAccountInfo(req, res) {
    try {
        const { accountNumber } = req.body;

        if (!accountNumber) {
            return res.status(400).json({ message: "Account number is required" });
        }
        
        const [userDetails] = await db.query('SELECT * FROM users WHERE account_number = ?', [accountNumber]);

        if (userDetails.length == 0) {
            return res.status(400).json({ message: "User account does not exist" });
        }

        if (userDetails[0].status != 'active') {
            return res.status(400).json({ message: "User account is blocked" });
        }

        return res.status(200).json({
            accountNumber: userDetails[0].account_number,
            fullName: userDetails[0].full_name,
            balance: userDetails[0].balance
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to handle cashier deposits
// Route" POST /api/cashier/deposit
async function cashierDeposit(req, res) {
    try {
        const { accountNumber, amount } = req.body;
        
        if (!accountNumber) {
            return res.status(400).json({ message: "Account number is required" });
        }
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid deposit amount" });
        }
        
        const [userDetails] = await db.query('SELECT * FROM users WHERE account_number = ?', [accountNumber]);

        if (userDetails.length == 0) {
            return res.status(400).json({ message: "User account does not exist" });
        }

        if (userDetails[0].status != 'active') {
            return res.status(400).json({ message: "User account is blocked" });
        }

        await db.query('UPDATE users SET balance = balance + ? WHERE account_number = ?', [amount, accountNumber]);

        return res.status(200).json({ message: "Deposit successful"});

    } catch (error) {
        console.error("Deposit error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Function to handle cashier withdrawal
// Route: POST /api/cashier/withdrawal
async function cashierWithdrawal(req, res) {
    try {
        const { accountNumber, amount } = req.body;

        if (!accountNumber) {
            return res.status(400).json({ message: "Account number is required" });
        }
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid withdrawal amount" });
        }

        const [userDetails] = await db.query('SELECT * FROM users WHERE account_number = ?', [accountNumber]);

        if (userDetails.length == 0) {
            return res.status(400).json({ message: "User account does not exist" });
        }

        if (userDetails[0].status !== 'active') {
            return res.status(400).json({ message: "User account is blocked" });
        }

        if (userDetails[0].balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        await db.query('UPDATE users SET balance = balance - ? WHERE account_number = ?', [amount, accountNumber]);

        return res.status(200).json({ message: "Withdrawal successful" });

    } catch (error) {
        console.error("Withdrawal error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { cashierLogin, cashierDeposit , cashierWithdrawal, cashierUserAccountInfo};
