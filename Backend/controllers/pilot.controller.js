const pilotModel = require('../models/pilot.model');
const pilotService = require('../services/pilot.service');
const blackListTokenModel = require('../models/blacklistToken.model');
const { validationResult } = require('express-validator');

module.exports.registerPilot = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isPilotAlreadyExist = await pilotModel.findOne({ email });

    if (isPilotAlreadyExist) {
        return res.status(400).json({ message: 'Pilot already exist' });
    }

    const hashedPassword = await pilotModel.hashPassword(password);

    const pilot = await pilotService.createPilot({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    const token = pilot.generateAuthToken();

    res.status(201).json({ token, pilot });
}

module.exports.loginPilot = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const pilot = await pilotModel.findOne({ email }).select('+password');

    if (!pilot) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await pilot.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = pilot.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({ token, pilot });
}

module.exports.getPilotProfile = async (req, res, next) => {
    res.status(200).json({ pilot: req.pilot });
}

module.exports.logoutPilot = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    await blackListTokenModel.create({ token });

    res.clearCookie('token');

    res.status(200).json({ message: 'Logout successfully' });
}
