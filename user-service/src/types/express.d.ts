import { IUser } from '../models/user.model';

declare global {
    namespace Express {
        interface Request {
            // In User Service, we fetch the full user, so we don't need the union type.
            // We can just say it is IUser.
            user?: IUser;
        }
    }
}