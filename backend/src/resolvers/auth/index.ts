
import { ApolloServer } from '@apollo/server';
import { isObject, merge } from 'lodash'
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import {
    GraphQLScalarType
} from 'graphql'
 
import { makeResolver, ResolverArguments } from '../helper'

const Private = () => {

    //GraphqlTypes
    const typesDir = path.resolve(__dirname, '../../schemas/auth');
    const typeFiles = fs.readdirSync(typesDir);
    const types = typeFiles.map(file => fs.readFileSync(path.join(typesDir, file), 'utf-8'));

    //Resolvers
    const resolversDir = path.resolve(__dirname, '../../resolvers/auth');

    const resolverFiles = fs.readdirSync(resolversDir);
    const resolvers: any = []
    resolverFiles.forEach(file => {
        let name = file.replace('.js', '');
        if (file != 'index.ts')
            resolvers[name] = require(__dirname + '/' + file);
    })

    let resolversMerge: any = {}

    Object.keys(resolvers).forEach(x => {
        const file = resolvers[x]
        Object.keys(file).forEach(y => {
            const resolver = file[y]

            let newObjResolver: any = {}
            newObjResolver[resolver.type] = {}
            newObjResolver[resolver.type][y] = (...args: [ResolverArguments]) => makeResolver(resolver, ...args)

            resolversMerge = merge(resolversMerge, newObjResolver)
        })
    })

    //Custom GraphqlTyps
    const AWSJSONScalar = new GraphQLScalarType({
        name: 'AWSJSON',
        description: 'JSON custom scalar type',
        serialize(value: any) {
            if (!value)
                return null
            else
                return JSON.stringify(value); // Convert outgoing Date to integer for JSON
        },
        parseValue(value: any) {
            return (value && JSON.parse(value)) || null; // Convert incoming integer to Date
        }
    });

    const AWSDateTimeScalar = new GraphQLScalarType({
        name: 'AWSDateTime',
        description: 'Datetime ISO format',
        serialize(value: any) {
            const realValue = value && moment(value).add('minutes', moment().utcOffset())
            return realValue.toISOString()
        },
        parseValue(value: any) {
            const realValue = value && moment(value).add('minutes', moment().utcOffset())
            return realValue.toISOString()
        },
    });

    const booleanScalar = new GraphQLScalarType({
        name: 'Boolean',
        description: 'Boolean',
        serialize(value: any) {
            return value && (value == '1' || value == 1 || value == true) ? true : false; // Convert outgoing 
        },
        parseValue(value: any) {
            return value && (value == '1' || value == 1 || value == 'true' || value == 'True') ? true : false; // Convert incoming 
        },
    });

    resolversMerge = {
        // Custom Data Types
        AWSJSON: AWSJSONScalar,
        AWSDateTime: AWSDateTimeScalar,
        Boolean: booleanScalar,

        //APP Resolvers
        ...resolversMerge
    };

    const server = new ApolloServer({
        typeDefs: types,
        resolvers: resolversMerge,
        introspection: true
    });

    return server

}

export default Private;