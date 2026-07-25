const { When } = require('@cucumber/cucumber');

// Regression coverage for the stale-selection-ref bug: savedRange used to live
// in useStore state (async setState on the React target), so saveSelection()
// -> restoreSelection() called back-to-back around this blocking prompt()
// read a stale/null value and the insert silently failed. See
// src/components/RichTextEditor.lite.tsx (savedRangeRef).
When('I will answer any prompt dialog with {string}', function (answer) {
  this.page.once('dialog', (dialog) => dialog.accept(answer));
});

When('I click the toolbar button titled {string}', async function (title) {
  await this.subject().locator(`button[title="${title}"]`).click();
});

// A toolbar insert needs a live selection/cursor inside the contentEditable
// region to restore into -- exactly like a real author clicking into the
// editor before using a toolbar button. Without this, there is nothing for
// saveSelection()/restoreSelection() to save or restore, and the insert is
// (correctly) a no-op, regardless of the stale-ref bug this suite guards
// against elsewhere.
When('I click into the editable content', async function () {
  await this.subject().locator('.wysiwyg-content').click();
});
