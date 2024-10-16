import { type IWriteable, type IBaseFilter } from '../models/base/IBase'

interface IStudentiBase {
  id: number
  name: string
  surname: string  
  email: string  
  classrromid: number
  courseids:number[]
}
export interface IStudentiWrite extends IStudentiBase {}
export interface IStudentiRead extends IStudentiBase {}
export interface IStudentiFilter extends IBaseFilter {}