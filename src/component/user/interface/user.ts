export interface UserData {
    userId: string;
    email: string;
    photo?:string;
    displayName: string;
    createdOn: CreatedOn
}
export interface CreatedOn {
    seconds: number
    nanoseconds: number
}