/*
 * SonarTS
 * Copyright (C) 2017-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.plugin.typescript.rules;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableList.Builder;
import com.google.common.collect.ImmutableSet;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.rule.Checks;
import org.sonar.api.rule.RuleKey;
import org.sonar.api.server.rule.RulesDefinition.NewRepository;
import org.sonar.plugin.typescript.TypeScriptRulesDefinition;
import org.sonarsource.analyzer.commons.RuleMetadataLoader;

/**
 * Facade for SonarTS rules
 * <ul>
 *  <li>Provides mapping between RSPEC rule keys and TSLint rule keys.</li>
 *  <li>Creates instances for activated rules and sets parameters</li>
 *  <li>Publishes rules to SQ from metadata</li>
 * </ul>
 */
public class TypeScriptRules implements Iterable<TypeScriptRule> {

  public static final Set<String> FILE_LEVEL_RULES = ImmutableSet.of("S113", "S104", "S1451");

  private static final String RESOURCE_FOLDER = "org/sonar/l10n/typescript/rules/typescript";

  private final List<TypeScriptRule> allRules;
  private final Map<String, RuleKey> tsLintKeyToRuleKey;

  public static void addToRepository(NewRepository repository) {
    RuleMetadataLoader ruleMetadataLoader = new RuleMetadataLoader(RESOURCE_FOLDER);
    ruleMetadataLoader.addRulesByAnnotatedClass(repository, new ArrayList<>(getRuleClasses()));
  }

  public TypeScriptRules(CheckFactory checkFactory) {
    Checks<TypeScriptRule> checks = checkFactory.<TypeScriptRule>create(TypeScriptRulesDefinition.REPOSITORY_KEY).addAnnotatedChecks((Iterable) getRuleClasses());
    Collection<TypeScriptRule> enabledRules = checks.all();
    tsLintKeyToRuleKey = new HashMap<>();
    for (TypeScriptRule typeScriptRule : enabledRules) {
      tsLintKeyToRuleKey.put(typeScriptRule.tsLintKey(), checks.ruleKey(typeScriptRule));
      typeScriptRule.enable();
    }
    allRules = buildAllRules(enabledRules);
  }

  private List<TypeScriptRule> buildAllRules(Collection<TypeScriptRule> enabledRules) {
    Builder<TypeScriptRule> rulesListBuilder = ImmutableList.builder();
    rulesListBuilder.addAll(enabledRules);
    rulesListBuilder.addAll(instantiateDisabledRules(enabledRules));
    return rulesListBuilder.build();
  }

  private List<TypeScriptRule> instantiateDisabledRules(Collection<TypeScriptRule> enabledRules) {
    Set<? extends Class<?>> activeRules = enabledRules.stream().map(Object::getClass).collect(Collectors.toSet());
    return getRuleClasses().stream()
      .filter(c -> !activeRules.contains(c))
      .map(TypeScriptRules::instantiate)
      .collect(Collectors.toList());
  }

  private static TypeScriptRule instantiate(Class<? extends TypeScriptRule> ruleClass) {
    try {
      return ruleClass.newInstance();
    } catch (InstantiationException | IllegalAccessException e) {
      throw new IllegalStateException("Failed to instantiate check " + ruleClass.getSimpleName(), e);
    }
  }

  public RuleKey ruleKeyFromTsLintKey(String tsLintKey) {
    RuleKey ruleKey = tsLintKeyToRuleKey.get(tsLintKey);
    Preconditions.checkNotNull(ruleKey, "Unknown tslint rule or rule not enabled %s", tsLintKey);
    return ruleKey;
  }

  @Override
  public Iterator<TypeScriptRule> iterator() {
    return allRules.iterator();
  }

  @VisibleForTesting
  public static List<Class<? extends TypeScriptRule>> getRuleClasses() {
    return ImmutableList.<Class<? extends TypeScriptRule>>builder()
      .add(AdjacentOverloadSignatures.class)
      .add(AwaitPromise.class)
      .add(ClassName.class)
      .add(Curly.class)
      .add(CyclomaticComplexity.class)
      .add(Deprecation.class)
      .add(Eofline.class)
      .add(FileHeader.class)
      .add(Indent.class)
      .add(LabelPosition.class)
      .add(MaxFileLineCount.class)
      .add(MaxLineLength.class)
      .add(NoAllDuplicatedBranches.class)
      .add(NoAngleBracketTypeAssertion.class)
      .add(NoAny.class)
      .add(NoArg.class)
      .add(NoArrayDelete.class)
      .add(NoCollectionSizeMischeck.class)
      .add(NoConsole.class)
      .add(NoConstruct.class)
      .add(NoDeadStore.class)
      .add(NoDebugger.class)
      .add(NoDuplicateSuper.class)
      .add(NoDuplicateVariable.class)
      .add(NoDuplicatedBranches.class)
      .add(NoEmptyDestructuring.class)
      .add(NoEmptyInterface.class)
      .add(NoEmptyNestedBlocks.class)
      .add(NoEval.class)
      .add(NoForInArray.class)
      .add(NoIdenticalConditions.class)
      .add(NoIdenticalExpressions.class)
      .add(NoInferrableTypes.class)
      .add(NoIgnoredReturn.class)
      .add(NoInconsistentReturn.class)
      .add(NoInternalModule.class)
      .add(NoInvalidTemplateStrings.class)
      .add(NoMagicNumbers.class)
      .add(NoMisleadingArrayReverse.class)
      .add(NoMisspelledOperator.class)
      .add(NoMisusedNew.class)
      .add(NoMultilineStringLiterals.class)
      .add(NoNonNullAssertion.class)
      .add(NoRequireImports.class)
      .add(NoSameLineConditional.class)
      .add(NoSelfAssignment.class)
      .add(NoShadowedVariable.class)
      .add(NoSparseArrays.class)
      .add(NoStringThrow.class)
      .add(NoUnconditionalJump.class)
      .add(NoUnenclosedMultilineBlock.class)
      .add(NoUnsafeFinally.class)
      .add(NoUnusedExpression.class)
      .add(NoUnthrownError.class)
      .add(NoUselessIncrement.class)
      .add(NoUseOfEmptyReturnValue.class)
      .add(NoVarKeyword.class)
      .add(NoVariableUsageBeforeDeclaration.class)
      .add(ObjectLiteralShorthand.class)
      .add(OneLine.class)
      .add(PreferForOf.class)
      .add(PreferTemplate.class)
      .add(RestrictPlusOperands.class)
      .add(Semicolon.class)
      .add(TripleEquals.class)
      .add(TypeofCompare.class)
      .add(VariableName.class)
      .add(UseIsnan.class)
      .add(UseDefaultTypeParameter.class)
      .add(Quotemark.class)
      .build();
  }

}
