export class ReservationAlreadyExistsException extends Error {
    readonly reason: string = 'RESERVATION_ALREADY_EXISTS';

    constructor(readonly reservationId: string) {
        super(`Reservation (${reservationId}) already exists`);
        this.name = 'ReservationAlreadyExistsException';
    }
}
