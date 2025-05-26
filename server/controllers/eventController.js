const createEvent = async (req, res) => {
    try {
        console.log('Received event data:', req.body);
        console.log('Received file:', req.file);
        console.log('User:', req.user);

        const eventData = { ...req.body };

        // Parse location if it's a string
        if (typeof eventData.location === 'string') {
            try {
                eventData.location = JSON.parse(eventData.location);
            } catch (error) {
                console.error('Error parsing location:', error);
                return res.status(400).json({ message: 'Invalid location format' });
            }
        }

        // Handle image upload if present
        if (req.file) {
            eventData.image = {
                url: req.file.path,
                public_id: req.file.filename
            };
        }

        // Set organizer from authenticated user
        eventData.organizer = req.user._id;

        console.log('Processed event data:', eventData);

        const event = new eventModel(eventData);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation Error', 
                errors: validationErrors 
            });
        }
        
        res.status(400).json({ 
            message: error.message,
            error: error.toString()
        });
    }
}; 