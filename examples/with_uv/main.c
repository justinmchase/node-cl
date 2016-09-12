#include <stdio.h>
#include <uv.h>

static uv_thread_t thread;
static void thread_cb(void* arg) {
  printf("from thread!\n");
}

int main(int argc, char **argv) {
  printf("starting...");
  int r = uv_thread_create(&thread, thread_cb, NULL);
  uv_thread_join(&thread);
  printf("done.\n");
  return 0;
}