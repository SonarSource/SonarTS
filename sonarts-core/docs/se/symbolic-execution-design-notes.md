# Symbolic Execution Design Notes for SonarTS

* The execution tree is currently visited depth-first and it's not currently using a worklist approach

* Rules are invoked at the end of the full visit of the exploded graph
** During execution we collect all the program states for each program point
** After execution the rule (or other callback) is called by providing the program point and the full set of program states

* Literal values are represented as `LiteralSymbolicValue`, which contains the exact value.
** We assume that once constraints are implemented the `LiteralSymbolicValue` will provide a constraint that corresponds to the value upon request.
** Other kinds of symbolic values so far are `UndefinedSymbolicValue`...

* The SE engine is invoked by providing a list of statements and an initial program state, which, in the case of functions/methods, needs to include the parameters. The responsibility to initialize that state is currently outside the engine

* We are keeping the 'state transition' logic outside of the main graph visit, the expression stack and the program state.
```
GraphVisit(OldProgramState) --> ProgramPoint
StateTransitions(ProgramPoint) --> StateTransition
StateTransition(OldProgramState) --> NewProgramState(s)
```
