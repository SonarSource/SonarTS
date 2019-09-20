/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
package org.sonar.plugin.typescript;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import org.sonar.api.batch.rule.CheckFactory;
import org.sonar.api.batch.rule.Checks;
import org.sonar.api.rule.RuleKey;
import org.sonar.api.server.rule.RulesDefinition.NewRepository;
import org.sonar.check.Rule;
import org.sonar.plugin.typescript.rules.ArgumentsOrder;
import org.sonar.plugin.typescript.rules.BanCommaOperator;
import org.sonar.plugin.typescript.rules.BoolParamDefault;
import org.sonar.plugin.typescript.rules.ClassName;
import org.sonar.plugin.typescript.rules.CognitiveComplexity;
import org.sonar.plugin.typescript.rules.ConsecutiveOverloads;
import org.sonar.plugin.typescript.rules.Curly;
import org.sonar.plugin.typescript.rules.Deprecation;
import org.sonar.plugin.typescript.rules.Eofline;
import org.sonar.plugin.typescript.rules.FileHeader;
import org.sonar.plugin.typescript.rules.Indent;
import org.sonar.plugin.typescript.rules.LabelPosition;
import org.sonar.plugin.typescript.rules.MaxFileLineCount;
import org.sonar.plugin.typescript.rules.MaxLineLength;
import org.sonar.plugin.typescript.rules.MaxSwitchCases;
import org.sonar.plugin.typescript.rules.MaxUnionSize;
import org.sonar.plugin.typescript.rules.MccabeComplexity;
import org.sonar.plugin.typescript.rules.NoAccessorFieldMismatch;
import org.sonar.plugin.typescript.rules.NoAllDuplicatedBranches;
import org.sonar.plugin.typescript.rules.NoAlphabeticalSort;
import org.sonar.plugin.typescript.rules.NoAngleBracketTypeAssertion;
import org.sonar.plugin.typescript.rules.NoAny;
import org.sonar.plugin.typescript.rules.NoArg;
import org.sonar.plugin.typescript.rules.NoArrayDelete;
import org.sonar.plugin.typescript.rules.NoBigFunction;
import org.sonar.plugin.typescript.rules.NoCaseWithOr;
import org.sonar.plugin.typescript.rules.NoCollapsibleIf;
import org.sonar.plugin.typescript.rules.NoCollectionSizeMischeck;
import org.sonar.plugin.typescript.rules.NoCommentedCode;
import org.sonar.plugin.typescript.rules.NoConditionalAssignment;
import org.sonar.plugin.typescript.rules.NoConsole;
import org.sonar.plugin.typescript.rules.NoDeadStore;
import org.sonar.plugin.typescript.rules.NoDebugger;
import org.sonar.plugin.typescript.rules.NoDuplicateImports;
import org.sonar.plugin.typescript.rules.NoDuplicateInComposite;
import org.sonar.plugin.typescript.rules.NoDuplicateString;
import org.sonar.plugin.typescript.rules.NoDuplicateSuper;
import org.sonar.plugin.typescript.rules.NoDuplicateVariable;
import org.sonar.plugin.typescript.rules.NoDuplicatedBranches;
import org.sonar.plugin.typescript.rules.NoElementOverwrite;
import org.sonar.plugin.typescript.rules.NoEmptyArray;
import org.sonar.plugin.typescript.rules.NoEmptyDestructuring;
import org.sonar.plugin.typescript.rules.NoEmptyInterface;
import org.sonar.plugin.typescript.rules.NoEmptyNestedBlocks;
import org.sonar.plugin.typescript.rules.NoEval;
import org.sonar.plugin.typescript.rules.NoExtraSemicolon;
import org.sonar.plugin.typescript.rules.NoForInArray;
import org.sonar.plugin.typescript.rules.NoGratuitousExpressions;
import org.sonar.plugin.typescript.rules.NoHardcodedCredentials;
import org.sonar.plugin.typescript.rules.NoIdenticalConditions;
import org.sonar.plugin.typescript.rules.NoIdenticalExpressions;
import org.sonar.plugin.typescript.rules.NoIdenticalFunctions;
import org.sonar.plugin.typescript.rules.NoIgnoredInitialValue;
import org.sonar.plugin.typescript.rules.NoIgnoredReturn;
import org.sonar.plugin.typescript.rules.NoImplicitDependencies;
import org.sonar.plugin.typescript.rules.NoInMisuse;
import org.sonar.plugin.typescript.rules.NoInconsistentReturn;
import org.sonar.plugin.typescript.rules.NoInferrableTypes;
import org.sonar.plugin.typescript.rules.NoInternalModule;
import org.sonar.plugin.typescript.rules.NoInvalidAwait;
import org.sonar.plugin.typescript.rules.NoInvalidTemplateStrings;
import org.sonar.plugin.typescript.rules.NoInvariantReturn;
import org.sonar.plugin.typescript.rules.NoInvertedBooleanCheck;
import org.sonar.plugin.typescript.rules.NoMagicNumbers;
import org.sonar.plugin.typescript.rules.NoMisleadingArrayReverse;
import org.sonar.plugin.typescript.rules.NoMisspelledOperator;
import org.sonar.plugin.typescript.rules.NoMisusedNew;
import org.sonar.plugin.typescript.rules.NoMultilineStringLiterals;
import org.sonar.plugin.typescript.rules.NoNestedIncdec;
import org.sonar.plugin.typescript.rules.NoNestedSwitch;
import org.sonar.plugin.typescript.rules.NoNestedTemplateLiterals;
import org.sonar.plugin.typescript.rules.NoNonNullAssertion;
import org.sonar.plugin.typescript.rules.NoRedundantBoolean;
import org.sonar.plugin.typescript.rules.NoRedundantJump;
import org.sonar.plugin.typescript.rules.NoRedundantParentheses;
import org.sonar.plugin.typescript.rules.NoRequireImports;
import org.sonar.plugin.typescript.rules.NoReturnAwait;
import org.sonar.plugin.typescript.rules.NoReturnTypeAny;
import org.sonar.plugin.typescript.rules.NoSameLineConditional;
import org.sonar.plugin.typescript.rules.NoSelfAssignment;
import org.sonar.plugin.typescript.rules.NoShadowedVariable;
import org.sonar.plugin.typescript.rules.NoSmallSwitch;
import org.sonar.plugin.typescript.rules.NoSparseArrays;
import org.sonar.plugin.typescript.rules.NoStatementsSameLine;
import org.sonar.plugin.typescript.rules.NoStringThrow;
import org.sonar.plugin.typescript.rules.NoThisAssignment;
import org.sonar.plugin.typescript.rules.NoTryPromise;
import org.sonar.plugin.typescript.rules.NoUnconditionalJump;
import org.sonar.plugin.typescript.rules.NoUndefinedArgument;
import org.sonar.plugin.typescript.rules.NoUnenclosedMultilineBlock;
import org.sonar.plugin.typescript.rules.NoUnsafeFinally;
import org.sonar.plugin.typescript.rules.NoUnthrownError;
import org.sonar.plugin.typescript.rules.NoUnusedArray;
import org.sonar.plugin.typescript.rules.NoUnusedExpression;
import org.sonar.plugin.typescript.rules.NoUseOfEmptyReturnValue;
import org.sonar.plugin.typescript.rules.NoUselessCast;
import org.sonar.plugin.typescript.rules.NoUselessCatch;
import org.sonar.plugin.typescript.rules.NoUselessIncrement;
import org.sonar.plugin.typescript.rules.NoUselessIntersection;
import org.sonar.plugin.typescript.rules.NoVarKeyword;
import org.sonar.plugin.typescript.rules.NoVariableUsageBeforeDeclaration;
import org.sonar.plugin.typescript.rules.ObjectLiteralShorthand;
import org.sonar.plugin.typescript.rules.OneLine;
import org.sonar.plugin.typescript.rules.ParametersMaxNumber;
import org.sonar.plugin.typescript.rules.PreferConst;
import org.sonar.plugin.typescript.rules.PreferDefaultLast;
import org.sonar.plugin.typescript.rules.PreferForOf;
import org.sonar.plugin.typescript.rules.PreferImmediateReturn;
import org.sonar.plugin.typescript.rules.PreferOptional;
import org.sonar.plugin.typescript.rules.PreferPromiseShorthand;
import org.sonar.plugin.typescript.rules.PreferReadonly;
import org.sonar.plugin.typescript.rules.PreferTemplate;
import org.sonar.plugin.typescript.rules.PreferTypeGuard;
import org.sonar.plugin.typescript.rules.PreferWhile;
import org.sonar.plugin.typescript.rules.Quotemark;
import org.sonar.plugin.typescript.rules.RestrictPlusOperands;
import org.sonar.plugin.typescript.rules.Semicolon;
import org.sonar.plugin.typescript.rules.TripleEquals;
import org.sonar.plugin.typescript.rules.TypeScriptRule;
import org.sonar.plugin.typescript.rules.UseDefaultTypeParameter;
import org.sonar.plugin.typescript.rules.UseIsnan;
import org.sonar.plugin.typescript.rules.UsePrimitiveType;
import org.sonar.plugin.typescript.rules.UseTypeAlias;
import org.sonar.plugin.typescript.rules.VariableName;
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

  public static final Set<String> FILE_LEVEL_RULES = Collections.unmodifiableSet(new HashSet<>(Arrays.asList("S113", "S104", "S1451")));

  private static final String RESOURCE_FOLDER = "org/sonar/l10n/typescript/rules/typescript";
  private static final String DEFAULT_PROFILE_PATH = RESOURCE_FOLDER + "/Sonar_way_profile.json";

  /**
   * This is a whitelist of rules which remain enabled while we migrate them to SonarJS
   */
  private static final List<String> RULES_PROVIDED_BY_SONARTS = Arrays.asList(
    "S101",
    "S117",
    "S105",
    "S1439",
    "S881",
    "S1110",
    "S1451",
    "S1821",
    "S2757",
    "S2870",
    "S3616",
    "S3972",
    "S3984",
    "S4622",
    "S4624",
    "S4782",

    "S125",
    "S1533",
    "S1541",
    "S1121",
    "S2068",
    "S2123",
    "S2201",
    "S2234",
    "S2681",
    "S2871",
    "S3981",
    "S4043",
    "S4123",
    "S4322",
    "S4275",
    "S4323",
    "S4324",
    "S4328",
    "S4335",
    "S4524",
    "S4619",
    "S4621",
    "S4623",
    "S4634",
    "S4798",
    "S4822",
    "S1874",
    "S2589",

    "S1226",
    "S1751",
    "S1854",
    "S3516",
    "S3626",
    "S4030",
    "S4158"
  );

  private final List<TypeScriptRule> allRules;
  private final Map<String, RuleKey> tsLintKeyToRuleKey;
  private final Map<String, TypeScriptRule> tsLintKeyToRuleObject;

  public static void addToRepository(NewRepository repository) {
    RuleMetadataLoader ruleMetadataLoader = new RuleMetadataLoader(RESOURCE_FOLDER, DEFAULT_PROFILE_PATH);
    ruleMetadataLoader.addRulesByAnnotatedClass(repository, new ArrayList<>(getRuleClasses()));
  }

  public TypeScriptRules(CheckFactory checkFactory) {
    Checks<TypeScriptRule> checks = checkFactory.<TypeScriptRule>create(TypeScriptRulesDefinition.REPOSITORY_KEY).addAnnotatedChecks((Iterable) getRuleClasses());
    Collection<TypeScriptRule> enabledRules = checks.all();
    tsLintKeyToRuleKey = new HashMap<>();
    tsLintKeyToRuleObject = new HashMap<>();
    for (TypeScriptRule typeScriptRule : enabledRules) {
      tsLintKeyToRuleKey.put(typeScriptRule.tsLintKey(), checks.ruleKey(typeScriptRule));
      tsLintKeyToRuleObject.put(typeScriptRule.tsLintKey(), typeScriptRule);
      typeScriptRule.enable();
    }
    allRules = buildAllRules(enabledRules);
  }

  private List<TypeScriptRule> buildAllRules(Collection<TypeScriptRule> enabledRules) {
    List<TypeScriptRule> rulesListBuilder = new ArrayList<>();
    rulesListBuilder.addAll(enabledRules);
    rulesListBuilder.addAll(instantiateDisabledRules(enabledRules));
    return Collections.unmodifiableList(rulesListBuilder);
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
    checkNotNull(ruleKey, "Unknown tslint rule or rule not enabled %s", tsLintKey);
    return ruleKey;
  }

  public String message(String tsLintKey, String nativeMessage) {
    TypeScriptRule rule = tsLintKeyToRuleObject.get(tsLintKey);
    checkNotNull(rule, "Unknown tslint rule or rule not enabled %s", tsLintKey);
    return rule.messageToForce().orElse(nativeMessage);
  }

  private static void checkNotNull(@Nullable Object obj, String msg, String... args) {
    if (obj == null) {
      throw new IllegalStateException(String.format(msg, args));
    }
  }

  @Override
  public Iterator<TypeScriptRule> iterator() {
    return allRules.iterator();
  }

  List<TypeScriptRule> enabledRules() {
    return allRules.stream().filter(TypeScriptRule::isEnabled).collect(Collectors.toList());
  }

  public static List<Class<? extends TypeScriptRule>> getRuleClasses() {
    return allRules().stream()
      .filter(c -> RULES_PROVIDED_BY_SONARTS.contains(c.getAnnotation(Rule.class).key()))
      .collect(Collectors.toList());
  }

  static List<Class<? extends TypeScriptRule>> allRules() {
    return Collections.unmodifiableList(Arrays.asList(
      ArgumentsOrder.class,
      BanCommaOperator.class,
      BoolParamDefault.class,
      ClassName.class,
      CognitiveComplexity.class,
      ConsecutiveOverloads.class,
      Curly.class,
      Deprecation.class,
      Eofline.class,
      FileHeader.class,
      Indent.class,
      LabelPosition.class,
      MaxFileLineCount.class,
      MaxLineLength.class,
      MaxSwitchCases.class,
      MaxUnionSize.class,
      MccabeComplexity.class,
      NoAccessorFieldMismatch.class,
      NoAllDuplicatedBranches.class,
      NoAlphabeticalSort.class,
      NoAngleBracketTypeAssertion.class,
      NoAny.class,
      NoArg.class,
      NoArrayDelete.class,
      NoBigFunction.class,
      NoCaseWithOr.class,
      NoCollapsibleIf.class,
      NoCollectionSizeMischeck.class,
      NoCommentedCode.class,
      NoConditionalAssignment.class,
      NoConsole.class,
      NoDeadStore.class,
      NoDebugger.class,
      NoDuplicateImports.class,
      NoDuplicateInComposite.class,
      NoDuplicateString.class,
      NoDuplicateSuper.class,
      NoDuplicateVariable.class,
      NoDuplicatedBranches.class,
      NoElementOverwrite.class,
      NoEmptyArray.class,
      NoEmptyDestructuring.class,
      NoEmptyInterface.class,
      NoEmptyNestedBlocks.class,
      NoEval.class,
      NoExtraSemicolon.class,
      NoForInArray.class,
      NoGratuitousExpressions.class,
      NoHardcodedCredentials.class,
      NoIdenticalConditions.class,
      NoIdenticalExpressions.class,
      NoIdenticalFunctions.class,
      NoIgnoredInitialValue.class,
      NoIgnoredReturn.class,
      NoImplicitDependencies.class,
      NoInMisuse.class,
      NoInconsistentReturn.class,
      NoInferrableTypes.class,
      NoInternalModule.class,
      NoInvalidAwait.class,
      NoInvalidTemplateStrings.class,
      NoInvariantReturn.class,
      NoInvertedBooleanCheck.class,
      NoMagicNumbers.class,
      NoMisleadingArrayReverse.class,
      NoMisspelledOperator.class,
      NoMisusedNew.class,
      NoMultilineStringLiterals.class,
      NoNestedIncdec.class,
      NoNestedSwitch.class,
      NoNestedTemplateLiterals.class,
      NoNonNullAssertion.class,
      NoRedundantBoolean.class,
      NoRedundantJump.class,
      NoRedundantParentheses.class,
      NoRequireImports.class,
      NoReturnAwait.class,
      NoReturnTypeAny.class,
      NoSameLineConditional.class,
      NoSelfAssignment.class,
      NoShadowedVariable.class,
      NoSmallSwitch.class,
      NoSparseArrays.class,
      NoStatementsSameLine.class,
      NoStringThrow.class,
      NoThisAssignment.class,
      NoTryPromise.class,
      NoUnconditionalJump.class,
      NoUndefinedArgument.class,
      NoUnenclosedMultilineBlock.class,
      NoUnsafeFinally.class,
      NoUnthrownError.class,
      NoUnusedArray.class,
      NoUnusedExpression.class,
      NoUseOfEmptyReturnValue.class,
      NoUselessCast.class,
      NoUselessCatch.class,
      NoUselessIncrement.class,
      NoUselessIntersection.class,
      NoVarKeyword.class,
      NoVariableUsageBeforeDeclaration.class,
      ObjectLiteralShorthand.class,
      OneLine.class,
      ParametersMaxNumber.class,
      PreferConst.class,
      PreferDefaultLast.class,
      PreferForOf.class,
      PreferImmediateReturn.class,
      PreferOptional.class,
      PreferPromiseShorthand.class,
      PreferReadonly.class,
      PreferTemplate.class,
      PreferTypeGuard.class,
      PreferWhile.class,
      Quotemark.class,
      RestrictPlusOperands.class,
      Semicolon.class,
      TripleEquals.class,
      UseDefaultTypeParameter.class,
      UseIsnan.class,
      UsePrimitiveType.class,
      UseTypeAlias.class,
      VariableName.class
    ));
  }
}
