export interface AuthenticatedRequest extends Request {
    user: {sub: string; email: string; role: string};
}