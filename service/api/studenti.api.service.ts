
import type { IStudentiFilter, IStudentiRead, IStudentiWrite } from '../../models/IStudenti'
import { BaseWriteApiService } from './base/base-api-service'
import type { AxiosInstance } from 'axios'

export class StudentiApiService extends BaseWriteApiService<
  IStudentiWrite,
  IStudentiRead,
  IStudentiFilter,
  number
> {
  override getServiceUrl(): string {
    return `${this.baseApi}/students`
  }

  constructor(axiosInstance: AxiosInstance) {
    super(axiosInstance)
  }
}
