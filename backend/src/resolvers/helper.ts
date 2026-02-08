import _ from 'lodash'
import { fieldsMap } from 'graphql-fields-list';
import moment from 'moment';

import { db } from '../core/database';
import * as services from '../../src/services'
// import Cache, { enumCacheType } from '../../src/utils/cache';

interface IRequestTemplate {
    class: string
    method: string
    model?: string
}

interface ITemplateInfo {
    field: string,
    requestTemplate: IRequestTemplate
    type: string
}

const servicesList: any = services

export const makeResolver = async (template: ITemplateInfo, root?: any, args?: any, ctx?: any, info?: any) => {

    const entity: any = servicesList[template.requestTemplate.class]

    // console.log("fieldsMap", fieldsMap(info))
    const selectionSetList = graphQlPaths(fieldsMap(info))

    let fields: string[] = []
    selectionSetList.forEach((item: string) => {
        //remuevo los valores principales del search con items y el retorno rows 
        item = item.replace('items/', '').replace('rows/', '')

        //se validan los tipos conocidos para remover
        if (item.length > 0 && item != 'total' && item != 'items' && item != 'rows' && item != 'count' && !item.includes('__typename')) {
            //si tiene un nivel de profundidad
            fields.push(item)
        }

    })

    if (ctx?.userId) {
        // let cache = Cache.getInstance(enumCacheType.REDIS); // Initialize Redis cache
        // await cache.setValue(`api:{lastActivity}:${ctx.userId}`, { userId: ctx.userId, accountId: ctx.accountId, date: moment().toISOString(), ip: ctx.ip }) // Store last activity timestamp for the user
        // await cache.setValue(`telemetry:{logs}:${ctx.userId}:${moment().unix()}`, {
        //     accountId: ctx.accountId,
        //     userId: ctx.userId,
        //     action: template.type,
        //     model: template.requestTemplate.model,
        //     method: template.field,
        //     args
        // }, 1000 * 60 * 10) // Store telemetry logs for 10 minutes
    }

    const theClass = new entity(db)
    const res = await theClass[template.requestTemplate.method](args, ctx, root, fields, template.requestTemplate.model)

    return res
}

const graphQlPaths = (json: any, parentPath?: any) => {

    let result: any = []
    _.each(_.keys(json), (key) => {

        let path = `${parentPath ? `${parentPath}/` : ''}${key}`
        result.push(path)

        var subObject = _.get(json, key)
        if (_.isObject(subObject)) {
            result = [...result, ...graphQlPaths(subObject, path)]
        }
    });
    return result
}

export interface ResolverArguments {
    root?: any,
    args?: any,
    ctx?: any,
    info?: any
}