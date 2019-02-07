# ncl
A node driven C/C++ build tool. Currently windows only.

## Usage
```sh
npm install @justinmchase/ncl --save-dev --save-exact
npx ncl
npx ncl watch
```

## Example Project File
```yaml
# build.yml
- target: hello
  type: exe
  sources:
  	- hello.c
  dependencies:
    - world

- target: world
  type: lib
  sources:
    - world.c
```
```cpp
// hello.c
#include <stdio.h>
#include "world.h"

int main(int argc, char **argv) {
	printf("hello ");
	printf("%s", get_world());
	printf("\n");
} 
```
```h
const char* get_world();
```
```cpp
// world.c
#include "world.h"

const char* get_world() {
	return "world!";
}
```