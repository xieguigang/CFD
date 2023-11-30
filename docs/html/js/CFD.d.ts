declare module "barrier" {
    export interface barrier {
        name: string;
        locations: number[];
    }
    export const barrierList: barrier[];
}
declare module "app" { }
