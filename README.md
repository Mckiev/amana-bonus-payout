# AMANA Bonus Payout

This project is a CLI script which pays out an AMANA bonus to Manifold users that have deposited more MANA than they have withdrawn.

It will send the AMANA to the most recent railgun deposit address of the given Manifold user.

Before executing the script, you will need to copy `example.env` to `.env` and then update the values in `.env`.

To execute the script:

```
# Install the dependencies
npm install

# Build the project
npm run build

# Run the script
npm start
```

After running `npm start`, the CLI script will begin. First, it will ask you whether you want to run the script as a `Production Run` or a `Test Run`. In the `Test Run`, the bonus payments are calculated and logged but never submitted.

If you select the `Production Run`, you will be shown the list of bonus payments that will be made and given a final opportunity to confirm that you would like to submit the payments. To confirm, you must enter the total bonus payment that was calculated.
