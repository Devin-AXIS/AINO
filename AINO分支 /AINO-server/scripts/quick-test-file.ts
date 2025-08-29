import { fieldProcessorManager, FieldDef } from '../src/lib/field-processors'

const fieldDef: FieldDef = {
    id: 'f1',
    key: 'file',
    kind: 'primitive',
    type: 'file',
    required: false,
}

const value = '155174848871571.doc'

const result = fieldProcessorManager.validateField(value, fieldDef)
console.log('validate file =>', result)


