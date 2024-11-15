import { bookingService, serviceService, stylistService } from '../models/database';

export const createNewBooking = async (bookingData) => {
    try {
        // Verifica disponibilità
        const bookedSlots = await stylistService.getStylistAvailability(
            bookingData.stylistId,
            bookingData.date
        );

        if (bookedSlots.includes(bookingData.time)) {
            throw new Error('Questo orario non è disponibile');
        }

        // Crea la prenotazione
        const bookingId = await bookingService.createAppointment(bookingData);
        return bookingId;
    } catch (error) {
        throw error;
    }
};

export const loadServices = async () => {
    try {
        const services = await serviceService.getAllServices();
        return services;
    } catch (error) {
        throw error;
    }
};

export const loadStylists = async () => {
    try {
        const stylists = await stylistService.getAllStylists();
        return stylists;
    } catch (error) {
        throw error;
    }
};
