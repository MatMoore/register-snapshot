# register-snapshot
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Changelog](https://img.shields.io/badge/Changelog-unreleased-yellow.svg)](CHANGELOG.md)
[![CircleCI](https://circleci.com/gh/MatMoore/register-snapshot.svg?style=shield)](https://circleci.com/gh/MatMoore/register-snapshot)

`register-snapshot` is a tool that manages snapshots of GOV.UK registers.

This is a personal project, so it's not maintained by the Government Digital Service.

## Quickstart
To download a register:

```
register-snapshot add https://country.register.gov.uk  # downloads to data/registers/country_current.json
git add data/registers
git commit -m 'added country register dataset'
```

Replace `country` with the ID of the register you want to use.

To update the data, run `register-snapshot fetch`:

```
register-snapshot fetch

# inspect and test changes

git add data/registers
git commit -m 'updated country dataset'
```

You can download multiple registers and the fetch command will update them all.

## But why?
This tool lets you download registers data without integrating with the API of each register.

Although each register has a [/records endpoint](https://docs.registers.service.gov.uk/api_reference/get_records) that returns its current records, records will change over time, so if you're building on top of registers data you need a process to keep it up to date.

With register-snapshot you can monitor for new updates, and update the data at any time with one command.

Non-current records are automatically filtered out by default.

If you also check the downloaded files into version control, you get an audit trail showing the data your application was using at any point in time.

## How to find a register
The tool can't list the available registers, but you can view a list at https://www.registers.service.gov.uk/registers/register.

The register ID is the first column.

Take that register ID and stick `.register.gov.uk` on the end of it to get the URL.

For example, the URL for the `approved-open-standard` register is: https://approved-open-standard.register.gov.uk

## Filtering records
For registers with `start-date` and/or `end-date` fields, records can be in one of three states:

- `archived`: `end-date` is in the past
- `pending`: `start-date` is in the future
- `current`: the record is not archived or pending

You can choose which records to download by setting the `status` flag to one of these values when downloading a register. Set `--status all` if you want to include everything.

⚠️ Note: `register-snapshot` only fetches `current` records by default.

## The `registers.json` file
Metadata about the data you've downloaded is saved to `data/registers.json`, which is used to perform incremental updates.

You should version control this file, but don't edit it by hand.

## Reverting data to an earlier version
The tool doesn't allow you to download older versions of a register, so you should use a version control tool (such as git) to track the history of the datasets you've downloaded.

Then you can use [git revert](https://git-scm.com/docs/git-revert) to roll back to an earlier version of the data if you need to.

## Command reference

#### `register-snapshot add <REGISTER URL>`

Add a register to `registers.json` and download the latest records.
If you've already added that register, it will be updated to match the latest records.

#### `register-snapshot fetch`

Download the latest data for every register in `registers.json`.

#### `register-snapshot status`

Check whether any registers in `registers.json` are out of date. The exit code is non-zero if any of them can be updated.

#### `register-snapshot remove <REGISTER NAME>`

Remove a register from `registers.json` and delete the downloaded data.