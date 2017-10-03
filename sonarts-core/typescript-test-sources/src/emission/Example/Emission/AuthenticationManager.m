#import "AuthenticationManager.h"
#import "ARDefaults.h"

#import <Extraction/ARSpinner.h>
#import <SAMKeychain/SAMKeychain.h>

#import <Artsy_Authentication/ArtsyAuthentication.h>
#import <Artsy_Authentication/ArtsyAuthenticationRouter.h>
#import <Artsy_Authentication/ArtsyToken.h>

@interface AuthenticationManager()
@property (nonatomic, strong) UIViewController *authenticationSpinnerController;
@end

@implementation AuthenticationManager

- (instancetype)initWithService:(NSString *)service
{
  if ((self = [super init])) {
    _service = service;
    [self updateFromStoredCredentials];
  };
  return self;
}

- (void)updateFromStoredCredentials
{

  _userID = [SAMKeychain accountsForService:self.service][0][kSAMKeychainAccountKey];
  _token = [SAMKeychain passwordForService:self.service account:_userID];
  _isAuthenticated = _userID && _token;
}

- (void)presentAuthenticationPromptOnViewController:(UIViewController *)viewController completion:(dispatch_block_t)completion
{
  if (self.authenticationSpinnerController == nil) {
    ARSpinner *spinner = [ARSpinner new];
    [spinner startAnimating];
    self.authenticationSpinnerController = [UIViewController new];
    self.authenticationSpinnerController.view = spinner;
    [viewController presentViewController:self.authenticationSpinnerController animated:NO completion:^{
      [self showAuthenticationToArtsy:nil completion:completion];
    }];
  }
}

/// Create an alert view to type in your user credentials

- (void)showAuthenticationToArtsy:(NSString *)errorMessage completion:(dispatch_block_t)completion
{
  NSString *message = errorMessage ? errorMessage : @"Enter your Artsy credentials";
  UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"Authentication"
                                                                 message:message
                                                          preferredStyle:UIAlertControllerStyleAlert];

  [alert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
    textField.placeholder = @"Email";
  }];

  [alert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
    textField.placeholder = @"Password";
    textField.secureTextEntry = YES;
  }];

  __weak UIAlertController *weakAlert = alert;
  [alert addAction:[UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action) {
    [self authenticateWithEmail:weakAlert.textFields[0].text
                       password:weakAlert.textFields[1].text
                keychainService:self.service
                     completion:completion];
  }]];

  [self.authenticationSpinnerController presentViewController:alert animated:YES completion:nil];
}

/// Attempt to log in with creds, if it fails, set up the alert view again

- (void)authenticateWithEmail:(NSString *)email password:(NSString *)password keychainService:(NSString *)service completion:(dispatch_block_t)completion;
{
  // These are from Eigen OSS: https://github.com/artsy/eigen/blob/0e193d1b/Makefile#L36-L37
  ArtsyAuthentication *auth = [[ArtsyAuthentication alloc] initWithClientID:@"e750db60ac506978fc70"
                                                               clientSecret:@"3a33d2085cbd1176153f99781bbce7c6"];

  BOOL useStaging = [[NSUserDefaults standardUserDefaults] boolForKey:ARUseStagingDefault];
  auth.router.staging = useStaging;

  [auth getWeekLongXAppTrialToken:^(ArtsyToken *token, NSError *error) {
    if (error) {
      NSLog(@"%@", error);
      [self showAuthenticationToArtsy:nil completion:completion];
    } else {
      [auth logInAndFetchUserDetailsWithEmail:email
                                     password:password
                                   completion:^(ArtsyToken *token, NSDictionary *userDetails, NSError *error) {
        (void)auth; // keep a strong reference for as long as needed
        dispatch_async(dispatch_get_main_queue(), ^{
          if (error) {
            NSLog(@"%@", error);
            [self showAuthenticationToArtsy:error.localizedFailureReason completion:completion];

          } else {
            NSString *userID = userDetails[@"_id"];
            NSString *accessToken = token.token;
            NSParameterAssert(userID);
            NSParameterAssert(accessToken);

            NSError *error = nil;
            [SAMKeychain setPassword:accessToken forService:service account:userID error:&error];
            if (error) {
              NSLog(@"%@", error);
            }

            [self.authenticationSpinnerController dismissViewControllerAnimated:YES completion:nil];
            [self updateFromStoredCredentials];
            completion();
          }
        });
      }];
    }
  }];
}

- (void)logOut
{
  NSString *userID = [SAMKeychain accountsForService:self.service][0][kSAMKeychainAccountKey];
  NSError *error = nil;
  [SAMKeychain deletePasswordForService:self.service account:userID error:&error];
  if(error) {
    NSLog(@"Error: %@", error.localizedDescription);
  }
}

@end
