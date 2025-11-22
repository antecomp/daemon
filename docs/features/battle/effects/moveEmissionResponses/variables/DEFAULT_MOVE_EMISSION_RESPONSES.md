[**daemon**](../../../../../README.md)

***

# Variable: DEFAULT\_MOVE\_EMISSION\_RESPONSES

> `const` **DEFAULT\_MOVE\_EMISSION\_RESPONSES**: `object`

Defined in: [src/features/battle/effects/moveEmissionResponses.ts:56](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/effects/moveEmissionResponses.ts#L56)

A read-only map of side-effect handlers keyed by emission identifiers. Each
handler is invoked when the corresponding emission is produced by a move
and is responsible for appending action messages and/or triggering minor
presentation-related side effects.

General handler signature:
(payload, helpers, meta)
- payload: emission-specific data (shape varies per emission key).
- helpers: runtime utilities, e.g. `appendActionMessage(message: string, tag?: string)`.
- meta: contextual information about the move and affected entity, e.g.
  `nameOfAffected(): string`, `moveName`, `lexicons`, `perspective`.
Notes:
- Messages are created using the provided `nameOfAffected()` callback to ensure
  correct, lazily-evaluated entity naming and perspective handling.

## Type Declaration

### effect:heal()

> `readonly` **effect:heal**(`__namedParameters`, `__namedParameters`, `__namedParameters`): `void`

#### Parameters

##### \_\_namedParameters

###### amount

`number`

###### capped

`boolean`

##### \_\_namedParameters

[`EmissionSEDeps`](../type-aliases/EmissionSEDeps.md)

##### \_\_namedParameters

[`EmissionSECTX`](../type-aliases/EmissionSECTX.md)

#### Returns

`void`

### mechanic:focus()

> `readonly` **mechanic:focus**(`__namedParameters`, `__namedParameters`, `__namedParameters`): `void`

#### Parameters

##### \_\_namedParameters

###### lost

`boolean`

##### \_\_namedParameters

[`EmissionSEDeps`](../type-aliases/EmissionSEDeps.md)

##### \_\_namedParameters

[`EmissionSECTX`](../type-aliases/EmissionSECTX.md)

#### Returns

`void`

### mechanic:mania()

> `readonly` **mechanic:mania**(`__namedParameters`, `__namedParameters`, `__namedParameters`): `void`

#### Parameters

##### \_\_namedParameters

###### manic

`boolean`

##### \_\_namedParameters

[`EmissionSEDeps`](../type-aliases/EmissionSEDeps.md)

##### \_\_namedParameters

[`EmissionSECTX`](../type-aliases/EmissionSECTX.md)

#### Returns

`void`

### status:prepare()

> `readonly` **status:prepare**(`__namedParameters`, `__namedParameters`, `__namedParameters`): `void`

#### Parameters

##### \_\_namedParameters

###### level

`number`

##### \_\_namedParameters

[`EmissionSEDeps`](../type-aliases/EmissionSEDeps.md)

##### \_\_namedParameters

[`EmissionSECTX`](../type-aliases/EmissionSECTX.md)

#### Returns

`void`
