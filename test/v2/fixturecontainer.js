define(
	'test/fixturecontainer', [
		'test/fixture-command',
		'test/fixture-pl-statement',
		'test/fixture-pl-each',
		'test/fixture-pl-variable',
		'test/fixture-pl-misc'
	],
	function(CommandFixture, LanguageStatementFixture, LanguageEachFixture, LanguageVariableFixture, LanguageMiscFixture) {
		return { 
			CommandFixture: CommandFixture,
			LanguageStatementFixture: LanguageStatementFixture,
			LanguageEachFixture: LanguageEachFixture,
			LanguageVariableFixture: LanguageVariableFixture//,
			//LanguageMiscFixture: LanguageMiscFixture
		};
	}
);
