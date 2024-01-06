export async function mkdirp(path: string) {
  await Deno.mkdir(path, {
    recursive: true,
  });
}
