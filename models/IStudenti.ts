import { type IWriteable, type IBaseFilter } from '../models/base/IBase'

interface IStudentiBase {
  id: number
  name: string
  surname: string  
  email: string  
  classrrom_id: number
  course_ids:number[]
}
export interface IStudentiWrite extends IStudentiBase {}
export interface IStudentiRead extends IStudentiBase {}
export interface IStudentiFilter extends IBaseFilter {}