# Financial Projector

An application for projecting personal finances via parameters against
benchmarks.

# Overview

## Purpose

Evaluate home purchaseability timelines based on savings projections and
affordability benchmarks.

## Input

Users can define their current savings and future saving plans. Users can also
define dynamic variables that may impact future savings.

## Output

# Data model

## Types

### `Frequency`: Enum

- `once`
- `daily`
- `weekly`
- `biweekly`
- `monthly`
- `yearly`
- `custom`

## Parameters

Values used to generate projections.

### `Parameter`

A single variable, which can be applied to columns on `Accounts`, `Streams`, and
`Segments`

- Used to calculate projections on `Accounts` via `Streams`
- Referenced through equation strings that can perform operations to the
  parameter value

**Schema**

- Primary key (`uid`)
  - `parameter_id`
- Values
  - `parameter_name`: varchar(64)
  - `value`: decimal
  - `symbol`: varchar(64)
  - `description`: varchar(2048)
- Foreign keys
  - `user_id`: uid
- Constraints
  - unique (`user_id`, `symbol`)

### `Account`

A single account, with a starting value and one or more `Streams`

- Used to calculate single projection values via `Streams`

**Schema**

- Primary key (`uid`)
  - `account_id`
- Parameters
  - `start_value_parameter`: varchar(2048)
- Values
  - `account_name`: varchar(64)
  - `start_date`: date
    - yyyy-mm-dd
    - the date on which to start calculations
- Foreign keys
  - `user_id`: uid

**Alternate names**

- UserAccount
- FinancialAccount

### `Stream`

A prediction for a single source of income/expense:

- Organized into one or more `Segments`.
- Expires based on its own expiration criteria or at expiration of its final
  `Segment`
  - Expires immediately once any expiration criteria are met
    - All unexpired or future segments will be ignored after expiration of the
      `Stream`
  - No expiration required - can run indefinitely

**Schema**

- Primary key (`uid`)
  - `stream_id`
- Parameters
  - `expiration_sum_parameter?`: varchar(2048)
    - max sum before expiring
    - includes total sum of all segments
- Values
  - `stream_name?`: varchar(64)
  - `expiration_date?`: date
    - yyyy-mm-dd
  - `expiration_days?`: int
    - \# of days before expiring
    - calculated from the `start_date` of either the parent `Account` the first
      child `Segment` - whichever is earlier
- Foreign keys
  - `user_id`: uid
  - `account_id`: uid
- Complex foreign keys
  - (`user_id`, `account_id`) => `account`

**Alternate names**

- Schedule

### `Segment`

A single segment of a `Stream`:

- Can be timebound to specific dates or relative to "today".
- Expires immediately once any expiration criteria are met or:
  - when the parent `Stream` expires
  - on the `start_date` of the next `Segment`

**Schema**

- Primary key (`uid`)
  - `segment_id`
- Parameters
  - `value_parameter`: varchar(2048)
    - value to add to the account
    - positive for income; negative for expenses
  - `expiration_sum_parameter?`: varchar(2048)
    - max sum before expiring
    - final instance may have a partial value if `expiration_sum` is not evenly
      divisible by `value_parameter` or if parent `Segment` has an
      `expiration_sum`
- Values
  - `segment_name?`: varchar(64)
  - `start_date?`: date (yyyy-mm-dd)
    - will start on `start_date` of parent `Account` if no `start_date` or
      `previous_segment_id` is defined on the `Segment`; will start one own
      `frequency_interval` after expiration of the previous `Segment` if
      `previous_segment_id` is defined
  - `frequency_interval`: Frequency
  - `custom_frequency_interval_days?`: int
    - \# of days per interval
    - only allowed if `frequency_interval` is `custom`
  - `expiration_date?`: date
    - yyyy-mm-dd
  - `expiration_days?`: int
    - \# of days before expiring
  - `expiration_intervals?`: int
    - \# of instances before expiring
- Foreign keys
  - `user_id`: uid
  - `account_id`: uid
  - `stream_id`: uid
  - `previous_segment_id?`: uid
  - `next_segment_id?`: uid
- Complex foreign keys
  - (`user_id`, `account_id`) => `account`
  - (`user_id`, `account_id`, `stream_id`) => `stream`
  - (`user_id`, `account_id`, `stream_id`, `previous_segment_id`) => `segment`
  - (`user_id`, `account_id`, `stream_id`, `next_segment_id`) => `segment`

**Alternate names**

- Period
- StreamSegment

###
