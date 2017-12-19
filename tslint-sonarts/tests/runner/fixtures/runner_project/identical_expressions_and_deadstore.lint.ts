function identical(x: boolean) {
  x = true;
  x = false;
  return x && x;
}
