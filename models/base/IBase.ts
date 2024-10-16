import type { CountType } from '../enums/countType'
import type { OrderValuesEnum } from "../enums/orderValuesEnum"
import type { Dictionary } from "../util/dictionary"

export interface IReadDto {
    DtIn: Date
    DtUp: Date | null
    UtIn: string
    UtUp: string
}
export interface IBaseFilter {
    cur_page: number
    page_size: number
    countType?: CountType
    fields_order: Dictionary<OrderValuesEnum>;
}

export interface IWriteable {
    id: any
}
