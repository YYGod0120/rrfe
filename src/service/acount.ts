import {IRegisterReq,IRegisterRes} from "../types/acount.ts";
import { service } from "./index.ts";
   
export const postRegister = async (params:IRegisterReq): Promise<IRegisterRes> => {
    const res = await service.post(`/api/user/register`,params);
    return res;
};
