import type { NextFunction, Request, Response } from "express";

export const allowAllCors = (req: Request, res: Response, next: NextFunction) => {
    // Set the 'Access-Control-Allow-Origin' header to '*' to allow any origin.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Set the 'Access-Control-Allow-Methods' header to allow common HTTP methods.
    // This includes GET, POST, PUT, DELETE, PATCH, OPTIONS.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

    // Set the 'Access-Control-Allow-Headers' header to allow common request headers.
    // This includes Content-Type, Authorization, X-Requested-With, Accept, Origin.
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

    // If the request method is 'OPTIONS', it's a preflight request.
    // Respond with a 200 OK status and end the response.
    // Preflight requests are sent by browsers to check which methods and headers are allowed.
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        // For all other request methods, pass control to the next middleware or route handler.
        next();
    }
};