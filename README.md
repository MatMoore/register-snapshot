# register-download
`register-download` is a tool that manages snapshots of GOV.UK registers.

It downloads the register's records in JSON or CSV format, and you control when to update the data.

If you check the downloaded files into version control, you have an audit trail that shows the data your application was using at any point in time.

⚠️️ Note: this is a personal project and is not maintained by the Government Digital Service.

## Usage
To download a new dataset:

```
register-download fetch country  # downloads to data/registers/country.json
git add data/registers
git commit -m 'added country register dataset'
```

Replace `country` with the name of the register you want to use.

You should periodically update the data by running `register-download` again:

```
register-download

# inspect and test changes

git add data/registers
git commit -m 'updated country dataset'
```

### How to find a register
The tool does not currently list the available registers. You can view a list at https://www.registers.service.gov.uk/registers.

To get the name of the register, click on it and take the last part of the URL.

For example, the register at
https://www.registers.service.gov.uk/registers/approved-open-standard is named `approved-open-standard`.

### Filtering records
For registers with `start-date` and/or `end-date` fields, records can be in one of three states:

- `archived`: `end-date` is in the past
- `pending`: `start-date` is in the future
- `current`: the record is not archived or pending

You can choose which records to download by setting the `status` flag to one of these values when downloading a register. Set `--status all` if you want to include everything.

⚠️ Note: Unlike the official registers website, `register-download` only fetches `current` records by default.

### Reverting data to an earlier version

The tool doesn't allow you to download older versions of a register, so you should use a version control tool (such as git) to track the history of the datasets you've downloaded.

Then you can use [git revert](https://git-scm.com/docs/git-revert) to roll back to an earlier version of the data if you need to.

### The registers.json file
Metadata about the data you've downloaded is saved to `data/registers.json`, which is used to perform incremental updates.

You should version control this file, but don't try to edit it by hand.

### Command reference

#### `register-download fetch <REGISTER URL>`

Add a register to `registers.json` and download the latest records.
If you've already downloaded a dataset, it will be updated to reflect the latest records.

#### `register-download fetch`

Download the latest data for every register in `registers.json`.

#### `register-download status`

Check whether any registers in `registers.json` are out of date.

#### `register-download remove <REGISTER NAME>`

Remove a register from `registers.json` and delete the downloaded data.