/**
 * @fileoverview "table reporter.
 * @author Gajus Kuizinas <gajus@gajus.com>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const chalk = require("chalk"),
    table = require("table").table,
    pluralize = require("pluralize");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Draws text table.
 * @param {Array<Object>} messages Error messages relating to a specific file.
 * @returns {string} A text table.
 */
function drawTable(messages) {
    const rows = [];

    if (messages.filter(item => (item.fatal || item.severity === 2)).length === 0) {
        return "";
    }

    rows.push([
        chalk.bold("Line"),
        chalk.bold("Column"),
        chalk.bold("Type"),
        chalk.bold("Message"),
        chalk.bold("Rule ID")
    ]);

    messages.forEach(message => {
        let messageType;

        if (message.fatal || message.severity === 2) {
            rows.push([
                message.line || 0,
                message.column || 0,
                chalk.red("error"),
                message.message,
                message.ruleId || ""
            ]);
        }
    });

    return table(rows, {
        columns: {
            0: {
                width: 8,
                wrapWord: true
            },
            1: {
                width: 8,
                wrapWord: true
            },
            2: {
                width: 8,
                wrapWord: true
            },
            3: {
                paddingRight: 5,
                width: 50,
                wrapWord: true
            },
            4: {
                width: 20,
                wrapWord: true
            }
        },
        drawHorizontalLine(index) {
            return index === 1;
        }
    });
}

/**
 * Draws a report (multiple tables).
 * @param {Array} results Report results for every file.
 * @returns {string} A column of text tables.
 */
function drawReport(results) {
    let files;

    files = results.map(result => {
        if (!result.messages.length || !result.messages.filter(item => item.severity !== 1).length) {
            return "";
        }

        return `\n${result.filePath}\n\n${drawTable(result.messages.filter(item => item.severity !== 1))}`;
    });

    files = files.filter(content => content.trim());

    return files.join("");
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function(report) {
    let result,
        errorCount,
        warningCount;

    result = "";
    errorCount = 0;
    warningCount = 0;

    report.forEach(fileReport => {
        errorCount += fileReport.errorCount;
        warningCount += fileReport.warningCount;
    });

    if (!errorCount) {
        return;
    }

    if (errorCount || warningCount) {
        result = drawReport(report);
    }

    result += `\n${table([
        [
            chalk.red(pluralize("Error", errorCount, true))
        ]
    ], {
        columns: {
            0: {
                width: 110,
                wrapWord: true
            }
        },
        drawHorizontalLine() {
            return true;
        }
    })}`;

    return result;
};
