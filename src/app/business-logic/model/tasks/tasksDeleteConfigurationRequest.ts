/**
 * tasks
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 2.14
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */



export interface TasksDeleteConfigurationRequest {
    /**
     * Task ID
     */
    task: string;
    /**
     * List of configuration itemss to delete
     */
    configuration: Array<string>;
    /**
     * If set to True then both new and running task configuration can be deleted.   Otherwise only the new task ones. Default is False
     */
    force?: boolean;
}
