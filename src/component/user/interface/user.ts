export interface UserData {
    userId: string;
    email: string;
    displayName: string;
    createdOn: CreatedOn
}
export interface CreatedOn {
    seconds: number
    nanoseconds: number
}