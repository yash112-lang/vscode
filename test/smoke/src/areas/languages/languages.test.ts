/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import minimist = require('minimist');
import { Application, ProblemSeverity, Problems } from '../../../../automation/out';

export function setup(opts: minimist.ParsedArgs) {
	describe('Language Features', () => {
		before(async function () {
			const app = new Application(this.defaultOptions);
			await app!.start(opts.web ? false : undefined);
			this.app = app;
		});

		after(async function () {
			await this.app.stop();
		});

		it('verifies quick outline', async function () {
			const app = this.app as Application;
			await app.workbench.quickaccess.openFile('style.css');

			await app.workbench.quickaccess.openQuickOutline();
			await app.workbench.quickinput.waitForQuickInputElements(names => names.length === 2);
		});

		it('verifies problems view', async function () {
			const app = this.app as Application;
			await app.workbench.quickaccess.openFile('style.css');
			await app.workbench.editor.waitForTypeInEditor('style.css', '.foo{}');

			await app.code.waitForElement(Problems.getSelectorInEditor(ProblemSeverity.WARNING));

			await app.workbench.problems.showProblemsView();
			await app.code.waitForElement(Problems.getSelectorInProblemsView(ProblemSeverity.WARNING));
			await app.workbench.problems.hideProblemsView();
		});

		it('verifies settings', async function () {
			const app = this.app as Application;
			await app.workbench.settingsEditor.addUserSetting('css.lint.emptyRules', '"error"');
			await app.workbench.quickaccess.openFile('style.css');

			await app.code.waitForElement(Problems.getSelectorInEditor(ProblemSeverity.ERROR));

			await app.workbench.problems.showProblemsView();
			await app.code.waitForElement(Problems.getSelectorInProblemsView(ProblemSeverity.ERROR));
			await app.workbench.problems.hideProblemsView();
		});
	});
}
