# no-hardcoded-credentials

Because it is easy to extract strings from a compiled application, credentials should never be hard-coded. Do so, and they're almost guaranteed to
end up in the hands of an attacker. This is particularly true for applications that are distributed.

Credentials should be stored outside of the code in a strongly-protected encrypted configuration file or database.

This rule flags instances of hard-coded credentials used in database and LDAP connections. It looks for hard-coded credentials in connection
strings, and for variable names that match any of the patterns from the provided list.

## See

<ul>
  <li> <a href="http://cwe.mitre.org/data/definitions/798">MITRE, CWE-798</a> - Use of Hard-coded Credentials </li>
  <li> <a href="http://cwe.mitre.org/data/definitions/259">MITRE, CWE-259</a> - Use of Hard-coded Password </li>
  <li> <a href="http://www.sans.org/top25-software-errors/">SANS Top 25</a> - Porous Defenses </li>
  <li> <a href="https://www.securecoding.cert.org/confluence/x/qQCHAQ">CERT, MSC03-J.</a> - Never hard code sensitive information </li>
  <li> OWASP Top 10 2017 Category A2 - Broken Authentication </li>
  <li> Derived from FindSecBugs rule <a href="http://h3xstream.github.io/find-sec-bugs/bugs.htm#HARD_CODE_PASSWORD">Hard Coded Password</a> </li>
</ul>


## Configuration

Custom list for variable names and patterns which are looked up in string literals can be provided. Default list is `"password","pwd","passwd"`.
```json
"no-hardcoded-credentials": true
"no-hardcoded-credentials": [true, "password", "secret", "token"]
```
