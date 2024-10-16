//import axiosInstance from '@/axios-config'
import { useAxios } from '../../../src/axios-config'
import type { AxiosInstance } from 'axios'

export abstract class BaseApiService {
  abstract getServiceUrl(): string
  protected get baseApi(): string {
    return 'https://localhost:7031'
  }

  protected _axios: AxiosInstance
  constructor(axiosInstance: AxiosInstance) {
    this._axios = axiosInstance
  }
}

export abstract class BaseReadApiService<TReadModel, TFilter, TId> extends BaseApiService {
  constructor(axiosInstance: AxiosInstance) {
    super(axiosInstance)
  }
  public async getById(id: TId): Promise<TReadModel> {
    const axiosResponse = await this._axios.get<TReadModel>(`${this.getServiceUrl()}/${id}`)
    return axiosResponse.data
  }
  public async find(filter: Partial<TFilter>): Promise<TReadModel[]> {
    const axiosResponse = await this._axios.get<TReadModel[]>(`${this.getServiceUrl()}/find`, {
      params: filter
    })
    return axiosResponse.data
  }
  public async export(filter: Partial<TFilter>): Promise<Blob> {
    const axiosResponse = await this._axios.get<Blob>(`${this.getServiceUrl()}/export`, {
        params: filter,
        responseType: 'blob'
    });
    return axiosResponse.data;
}
  public async count(filter: Partial<TFilter>): Promise<number> {
    const axiosResponse = await this._axios.get<number>(`${this.getServiceUrl()}/count`, {
      params: filter
    })
    return axiosResponse.data
  }

  public async findAndCount(filter: Partial<TFilter>): Promise<[TReadModel[], number]> {
    const [find, count] = await Promise.all([this.find(filter), this.count(filter)])
    return [find, count]
  }
}

export abstract class BaseWriteApiService<TWriteModel, TReadModel, TFilter, TId> extends BaseReadApiService<
  TReadModel,
  TFilter,
  TId
> {
  constructor(axiosInstance: AxiosInstance) {
    super(axiosInstance)
  }
  public async upset(item: Partial<TWriteModel>, id: TId | undefined) {
    if (id) return this.update(id, item)
    else return this.insert(item)
  }
  public async insert(item: Partial<TWriteModel>): Promise<TReadModel> {
    const axiosResponse = await this._axios.post<TReadModel>(`${this.getServiceUrl()}`, item)
    return axiosResponse.data
  }
  public async update(id: TId, item: Partial<TWriteModel>): Promise<TReadModel> {
    const axiosResponse = await this._axios.put<TReadModel>(`${this.getServiceUrl()}/${id}`, item)
    return axiosResponse.data
  }
  public async delete(id: number): Promise<void> {
    const axiosResponse = await this._axios.delete<void>(`${this.getServiceUrl()}/${id}`)
    return axiosResponse.data
  }
}
