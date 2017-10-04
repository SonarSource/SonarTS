function bar(x: number): boolean {
  <div/>;
  if (<div/> === <div/>) { // S1764
    return true;
  }
  return false;
}
