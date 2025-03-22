
import express  from 'express';
import bcrypt  from 'bcryptjs';
import Customer from '../modal/CustomerModal.js';

const loginRouter =express.Router();


const isUserExist = async (email) => {
    const existingUser = await Customer.findOne({ email });
    return !!existingUser;
};

// Register API
loginRouter.post('/register', async (req, res) => {
    try {
        console.log("Entered register API");
        const { firstName, lastName, email, phoneNumber, password } = req.body;

        // Input validation
        if (!firstName) return res.status(400).json({ message: "Username is required" });
        if (!email) return res.status(400).json({ message: "Email is required" });
        // if (["admin@admin.com", "admin@gmail.com"].includes(email)) {
        //     return res.status(400).json({ message: `Can't signup with email ${email}` });
        // }
        if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });
        if (!password) return res.status(400).json({ message: "Password is required" });

        // Check if user already exists
        if (await isUserExist(email)) {
            return res.status(409).json({ message: `Customer already registered with email ${email}` });
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new customer
        const newCustomer = new Customer({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            isAdmin: false,
        });

        await newCustomer.save();

        return res.status(201).json({ message: "Customer registered successfully" });

    } catch (error) {
        console.error("Error registering customer:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

loginRouter.post('/customer/login', async (req, res) => {
    const { email, password } = req.body;

    console.log("entered login api");

    try {
        const existingCustomer = await Customer.findOne({ email });
        const isMatch = await bcrypt.compare(password, existingCustomer.password);
        if (email === "admin@gmail.com" && isMatch) {
            const adminDetails = {
                emailId: existingCustomer.email,
                role: "admin",
                userName: existingCustomer.firstName,
                userId: "12345678"
            };
            return res.status(200).json(adminDetails);
        }
        if (existingCustomer) {
            
            if (!isMatch) {
                return res.status(400).json({ message: "Email password mismatch" });
            }

            const customerDetails = {
                emailId: existingCustomer.email,
                userName: existingCustomer.firstName,
                role: "customer",
                userId: existingCustomer._id
            };
            return res.status(200).json(customerDetails);
        } else {
            return res.status(404).json({ message: "User does not exist" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
});




export default loginRouter;
