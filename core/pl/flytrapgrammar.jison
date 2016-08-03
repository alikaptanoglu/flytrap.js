%{ 
%}

/* lexical grammar */
%lex

%%
\s+                   /* skip whitespace */
[0-9]+("."[0-9]+)?\b        return 'NUMBER';
\'(?:[^\']+|\'\')+\'|\'\'   return 'STRING';
"flytrap"                   return 'FLYTRAP';
"antidependency"            return 'ANTIDEPENDENCY';
"dependency"                return 'DEPENDENCY';
"perform"                   return 'PERFORM';
"click"                     return 'CLICK';
"check"                     return 'CHECK';
"hash"                      return 'HASH';
"after"                     return 'AFTER';
"seconds"                   return 'SECONDS';
"second"                    return 'SECOND';
"if"                        return 'IF';
"exists"                    return 'EXISTS';
"begin"                     return 'BEGIN';
"end"                       return 'END';
"else"                      return 'ELSE';
"!"                         return 'BANG';
"value"                     return 'VALUE';
"focus"                     return 'FOCUS';
"goto"                      return 'GOTO';
"log"                       return 'LOG';
"set"                       return 'SET';
"to"                        return 'TO';
"skip"                      return 'SKIP';
"after"                     return 'AFTER';
"attempts"                  return 'ATTEMPTS';
"attempt"                   return 'ATTEMPT'
"repeat"                    return 'REPEAT';
"times"                     return 'TIMES';
"time"                      return 'TIME'
"for"                       return 'FOR';
"each"                      return 'EACH';
"in"                        return 'IN';
"checkpoint"                return 'CHECKPOINT';
"assert"                    return 'ASSERT';
"execute"                   return 'EXECUTE';
"with"                      return 'WITH';
"as"                        return 'AS';
\@[A-Za-z0-9_]+             return 'VARIABLE';
[A-Za-z0-9_]+               return 'PROPERTY';
"="                         return 'EQUALS';
","                         return 'COMMA';
"."                         return 'DOT';
"["                         return 'LEFT_BRACKET';
"]"                         return 'RIGHT_BRACKET';
"{"                         return 'LEFT_BRACE';
"}"                         return 'RIGHT_BRACE';
":"                         return 'COLON';
"+"                         return 'PLUS';
"("                         return 'LEFT_PARENTHESES';
")"                         return 'RIGHT_PARENTHESES';
<<EOF>>                     return 'EOF';


/lex

/* operator associations and precedence */

%start flytrap_script

%% /* language grammar */

flytrap_script
    : flytrap_decl stmt_list EOF
        { 
            $$ = $1;
            $$.flytrap.statement_list = $2;
            return $$;
        }
    ;

stmt_list
    : stmt
        {
            $$ = [$1]
        }
    | stmt_list stmt
        {
            $$ = $1
            $$.push($2);
        }
    ;

stmt
    : flytrap_command_decl
    | assignment
    | conditional_stmt
    | each_block
    | execute_stmt
    ;

flytrap_decl
    : FLYTRAP expression
        {
            $$ = { type: 'flytrap', flytrap: { flytrap: $2, options: [] } }
        }
    | FLYTRAP expression flytrap_decl_options
        {
            $$ = { type: 'flytrap', flytrap: { flytrap: $2, options: $3 } }
        }
    ;

flytrap_decl_options
    : flytrap_decl_option
        {
            $$ = [$1]
        }
    | flytrap_decl_options flytrap_decl_option
        {
            $$ = $1
            $$.push($2)
        }
    ;

flytrap_decl_option
    : ANTIDEPENDENCY expression_list
        {
            $$ = { type: 'antidependency', operands: $2 }
        }
    ;

flytrap_command_decl
    : subcommand
        {
            $$ = { type: 'command', command: { command: $1.type, modifiers: [$1] } }
        }
    | LEFT_PARENTHESES command_modifiers RIGHT_PARENTHESES
        {
            $$ = { type: 'command', command: { command: { type: 'expr_str', expr_str: '' }, modifiers: $2} }
        }
    | CHECKPOINT expression
        {
            $$ = { type: 'checkpoint', checkpoint: $2 }
        }
    | ASSERT comparable
        {
            $$ = { type: 'assert', assert: { comparable: $2 } }
        }
    ;

comparable
    : EXISTS expression
        {
            $$ = { type: 'exists', exists: { operands: [$2] } }
        }
    ;

command_modifiers
    : command_modifier
        {
            $$ = [$1]
        }
    | command_modifiers command_modifier
        {
            $$ = $1
            $$.push($2)
        }
    ;

command_modifier
    : subcommand
    | command_option
    ;

subcommand
    : CLICK expression_list
        {
            $$ = { type: 'click', operands: $2 }
        }
    | CLICK expression_list BANG
        {
            $$ = { type: 'hardClick', operands: $2 }
        }
    | CHECK expression_list
        {
            $$ = { type: 'check', operands : $2 }
        }
    | HASH expression_list
        {
            $$ = { type: 'hash', operands : $2 }
        }
    | VALUE expression_list
        {
            $$ = { type: 'value', operands: $2 }
        }
    | SET expression TO expression
        {
            $$ = { type: 'value', operands: [ $2, $4 ] }
        }
    | FOCUS expression_list
        {
            $$ = { type: 'focus', operands: $2 }
        }
    | LOG expression_list
        {
            $$ = { type: 'log', operands: $2 }
        }
    | GOTO expression
        {
            $$ = { type: 'goto', operands: [$2] }
        }
    ;

command_option
    : AFTER NUMBER seconds
        {
            $$ = { type: 'afterSeconds', operands: [$2] }
        }
    | ANTIDEPENDENCY expression_list
        {
            $$ = { type: 'antidependency', operands: $2 }
        }
    | DEPENDENCY expression_list
        {
            $$ = { type: 'dependency', operands: $2 }
        }
    | SKIP AFTER NUMBER attempts
        {
            $$ = { type: 'skipAfterAttempts', operands: [$3] }
        }
    | REPEAT NUMBER times
        {
            $$ = { type: 'repeat', operands: [$2] }
        }
    ;

seconds
    : SECOND
    | SECONDS
    ;

times
    : TIME
    | TIMES
    ;

attempts
    : ATTEMPT
    | ATTEMPTS
    ;

assignment
    : VARIABLE EQUALS expression
        {
            $$ = { type: 'assignment', assignment: { variable: $1, value: $3 } }
        }
    ;

execute_stmt
    : EXECUTE expression with_list
        {
            $$ = { type: 'module', module: { name: $2, inputs: $3} }
        }
    | EXECUTE expression
        {
            $$ = { type: 'module', module: { name: $2 } }
        }
    ;

with_list
    : with
        {
            $$ = [$1]
        }
    | with_list with
        {
            $$ = $1;
            $$.push($2);
        }
    ;

with
    : WITH expression AS VARIABLE
        {
            $$ = { variable: $4, value: $2 }
        }
    ;

conditional_stmt
    : IF comparable conditional_dependencies conditional_block
        {
            $$ = { type: 'if', if: { comparable: $2, then_statements: $4.then_statements, else_statements: $4.else_statements, modifiers: $3 } }
        }
    | IF comparable conditional_block
        {
            $$ = { type: 'if', if: { comparable: $2, then_statements: $3.then_statements, else_statements: $3.else_statements } }
        }
    ;

conditional_block
    : BEGIN stmt_list END
        {
            $$ = { then_statements: $2 }
        }
    | BEGIN stmt_list END ELSE BEGIN stmt_list END
        {
            $$ = { then_statements: $2, else_statements: $6 }
        }
    ;

conditional_dependencies
    : conditional_dependency
        {
            $$ = [$1]
        }
    | conditional_dependencies conditional_dependency
        {
            $$ = $1;
            $$.push($2)
        }
    ;

conditional_dependency
    : DEPENDENCY expression_list
        {
            $$ = { type: 'dependency', operands: $2 }
        }
    | ANTIDEPENDENCY expression_list
        {
            $$ = { type: 'antidependency', operands: $2}
        }
    ;

each_block
    : EACH VARIABLE IN expression BEGIN stmt_list END
        {
            $$ = { type: 'each', each: { iterator_var_name: $2, iterator_expr: $4, statement_list: $6 } }
        }
    ;

expression_list
    : composition
        {
            $$ = [$1]
        }
    | expression_list COMMA composition
        {
            $$ = $1;
            $$.push($3);
        }
    | json_blob
        {
            $$ = [$1]
        }
    | expression_list COMMA json_blob
        {
            $$ = $1;
            $$.push($3);
        }
    ;

expression
    : composition
    | array
    | json_blob
    ;

array
    : LEFT_BRACKET expression_list RIGHT_BRACKET
        {
            $$ = { type: 'expr_arr', expr_arr: $2 }
        }

    | LEFT_BRACKET RIGHT_BRACKET
        {
            $$ = { type: 'expr_arr', expr_arr: [] }
        }
    ;

json_blob
    : LEFT_BRACE obj_key_list RIGHT_BRACE
        {
            $$ = { type: 'expr_obj', expr_obj: { props: $2 } }
        }
    ;

obj_key_list
    : obj_key
        {
            $$ = [$1];
        }
    | obj_key_list COMMA obj_key
        {
            $$ = $1;
            $$.push($3);
        }
    ;

obj_key
    : PROPERTY COLON composition
        {
            $$ = { key: { type: 'expr_str', expr_str: $1 }, value: $3 }
        }
    | PROPERTY COLON json_blob
        {
            $$ = { key: { type: 'expr_str', expr_str: $1 }, value: $3 }
        }
    | PROPERTY COLON array
        {
            $$ = { key: { type: 'expr_str', expr_str: $1 }, value: $3 }
        }
    ;

composition
    : concatenation
        {
            $$ = $1.length == 1 ? $1[0] : { type: 'expr_concat', expr_concat: $1 };
        }
    ;

dot_notation
    : VARIABLE dot_list
        {
            $$ = { keys: $2, source: { type: 'expr_var', expr_var: { variableName: $1 } } }
        }
    ;

dot_list
    : DOT PROPERTY
        {
            $$ = [$2]
        }
    | dot_list DOT PROPERTY
        {
            $$ = $1;
            $$.push($3);
        }
    ;

concatenation
    : composable
        {
            $$ = [$1]
        }
    | concatenation PLUS composable
        {
            $$ = $1;
            $$.push($3);
        }
    ;

composable
    : STRING
        {
            var s = $1 == '\'\'' ? '' : $1.substring(1, this.$.length - 1).replace(/\'\'/g, "'"); 
            $$ = { type: 'expr_str', expr_str: s }
        }
    | VARIABLE
        {
            $$ = { type: 'expr_var', expr_var: { variableName: $1 } }
        }
    | dot_notation
        {
            $$ = $1.length == 1 ? $1[0] : { type: 'expr_dot', expr_dot: $1 };
        }
    ;
