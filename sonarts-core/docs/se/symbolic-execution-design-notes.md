# Symbolic Execution Design Notes for SonarTS

* The execution tree is currently visited depth-first and it's not currently using a worklist approach to avoid recursion

* Rules are not involved directly in SE
 * During execution we collect all the program states for each program point
 * After execution we return an `ExecutionResult` that the rule(s) can use

* Unknown values start without constraints
* Literal values are represented as `LiteralSymbolicValue`, which contains the exact value.
 * `LiteralSymbolicValue` lazily provides a constraint that (currently) roughly represents the value.
 * Other kinds of symbolic values so far are `UndefinedSymbolicValue`...

* The SE engine is invoked by providing a list of statements and an initial program state, which, in the case of functions/methods, needs to include the parameters. The responsibility to initialize that state is outside the engine.

* We are keeping the 'state transition' logic outside of the main graph visit, the expression stack and the program state.
```
GraphVisit(OldProgramState) --> ProgramPoint
StateTransitions(ProgramPoint) --> StateTransition
StateTransition(OldProgramState) --> NewProgramState(s)
```
* The use of Immutable JS seems to make read-access to `ProgramState` internal structures slow. Currently we are comparing program states only for Branching Blocks. This may generate a bit more program states, but it should still guarantee to stop re-visiting whole blocks redundantly.